package datastores

import (
	"bultdatabasen/domain"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type txKey struct{}

type psqlDatastore struct {
	tx *gorm.DB
}

func NewDatastore() domain.Datastore {
	return &psqlDatastore{
		tx: db,
	}
}

func injectTx(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

func extractTx(ctx context.Context) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return nil
}

func (store *psqlDatastore) model(ctx context.Context, model ...interface{}) *gorm.DB {
	tx := extractTx(ctx)
	if tx != nil {
		return tx
	}

	return store.tx
}

func (store *psqlDatastore) WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return err
	}

	err := fn(injectTx(ctx, tx))
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (store *psqlDatastore) GetUser(ctx context.Context, userID string) (domain.User, error) {
	var user domain.User

	if err := store.tx.First(&user, "id = ?", userID).Error; err != nil {
		return domain.User{}, err
	}

	return user, nil
}

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx.Save(user).Error
}

func (store *psqlDatastore) InsertUser(ctx context.Context, user domain.User) error {
	return store.tx.Create(user).Error
}

func (store *psqlDatastore) GetUserNames(ctx context.Context) ([]domain.User, error) {
	var names []domain.User = make([]domain.User, 0)

	if err := store.tx.Raw(`SELECT id, first_name, SUBSTRING(last_name, 1, 1) AS last_name FROM "user"`).
		Scan(&names).Error; err != nil {
		return names, err
	}

	return names, nil
}

func (store *psqlDatastore) GetRoles(ctx context.Context, userID string) []domain.ResourceRole {
	var roles []domain.ResourceRole

	store.tx.Raw(`SELECT resource_id, role
			FROM "user" u
			INNER JOIN user_role ON u.id = user_role.user_id
			WHERE u.id = ?
	UNION
		SELECT resource_id, role
			FROM user_team
			INNER JOIN team_role ON user_team.team_id = team_role.team_id
			WHERE user_team.user_id = ?`, userID, userID).Scan(&roles)

	return roles
}

func (store *psqlDatastore) InsertResourceAccess(ctx context.Context, resourceID uuid.UUID, userID string, role domain.RoleType) error {
	return store.tx.Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, resourceID, role).Error
}

func (store *psqlDatastore) GetAncestors(ctx context.Context, resourceID uuid.UUID) (domain.Ancestors, error) {
	var ancestors []domain.Resource

	err := store.tx.Raw(`WITH path_list AS (
		SELECT COALESCE(t1.path, t2.path) AS path FROM resource
		LEFT JOIN tree t1 ON resource.id = t1.resource_id
		LEFT JOIN tree t2 ON resource.leaf_of = t2.resource_id
		WHERE id = @resourceID
	)
	SELECT REPLACE(id, '_', '-')::uuid AS id, name, type, CASE WHEN type <> 'root' THEN REPLACE(subpath(path, no::integer - 2, 1)::text, '_', '-')::uuid ELSE NULL END AS parent_id FROM (
		SELECT DISTINCT ON (path.id) path.id, name, type, path_list.path, no
		FROM path_list, unnest(string_to_array(path_list.path::text, '.')) WITH ORDINALITY AS path(id, no)
		INNER JOIN resource ON REPLACE(path.id, '_', '-')::uuid = resource.id
		WHERE resource.id <> @resourceID
	) ancestor
	ORDER BY no ASC`, sql.Named("resourceID", resourceID)).Scan(&ancestors).Error

	if err != nil {
		return nil, err
	}

	return ancestors, nil
}

func (store *psqlDatastore) GetChildren(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	var children []domain.Resource = make([]domain.Resource, 0)

	err := store.tx.Raw(`SELECT resource.* 
	FROM tree
	INNER JOIN resource ON tree.resource_id = resource.id
	WHERE path ~ ?
	ORDER BY name`, fmt.Sprintf("*.%s.*{1}", strings.ReplaceAll(resourceID.String(), "-", "_"))).Scan(&children).Error

	if err != nil {
		return nil, err
	}

	return children, nil
}

func (store *psqlDatastore) GetParents(ctx context.Context, resourceIDs []uuid.UUID) ([]domain.Parent, error) {
	var parents []domain.Parent = make([]domain.Parent, 0)

	err := store.tx.Raw(`SELECT id, name, type, tree.resource_id as child_id
		FROM tree
		INNER JOIN resource parent ON REPLACE(subpath(tree.path, -2, 1)::text, '_', '-')::uuid = parent.id
		WHERE resource_id IN ?`, resourceIDs).Scan(&parents).Error

	return parents, err
}

func (store *psqlDatastore) Search(ctx context.Context, name string) ([]domain.ResourceWithParents, error) {
	type searchResult struct {
		ID   uuid.UUID
		Name string
		Type domain.ResourceType

		ParentID   *uuid.UUID          `gorm:"column:r2_id"`
		ParentName string              `gorm:"column:r2_name"`
		ParentType domain.ResourceType `gorm:"column:r2_type"`

		GrandParentID   *uuid.UUID          `gorm:"column:r3_id"`
		GrandParentName string              `gorm:"column:r3_name"`
		GrandParentType domain.ResourceType `gorm:"column:r3_type"`
	}

	var results []searchResult
	var resources []domain.ResourceWithParents = make([]domain.ResourceWithParents, 0)

	err := store.tx.Raw(`SELECT
		r1.*,
		r2.id as r2_id, r2.name as r2_name, r2.type as r2_type,
		r3.id as r3_id, r3.name as r3_name, r3.type as r3_type
	FROM resource r1
	INNER JOIN tree on r1.id = tree.resource_id
	LEFT JOIN resource r2 ON nlevel(tree.path) >= 3 AND REPLACE(subpath(tree.path, -2, 1)::text, '_', '-')::uuid = r2.id
	LEFT JOIN resource r3 ON nlevel(tree.path) >= 4 AND REPLACE(subpath(tree.path, -3, 1)::text, '_', '-')::uuid = r3.id
	WHERE r1.type IN ('area', 'crag', 'sector', 'route') AND r1.name ILIKE ? AND subpath(tree.path, 0, 1) = ?
	LIMIT 20`,
		fmt.Sprintf("%%%s%%", name),
		strings.ReplaceAll(domain.RootID, "-", "_")).Scan(&results).Error

	for _, result := range results {
		parents := make([]domain.Parent, 0)

		if result.ParentID != nil {
			parentName := strings.Clone(result.ParentName)
			parents = append(parents, domain.Parent{
				ID:   *result.ParentID,
				Name: &parentName,
				Type: result.ParentType,
			})
		}

		if result.GrandParentID != nil {
			grandParentName := strings.Clone(result.GrandParentName)
			parents = append(parents, domain.Parent{
				ID:   *result.GrandParentID,
				Name: &grandParentName,
				Type: result.GrandParentType,
			})
		}

		name := strings.Clone(result.Name)
		resources = append(resources, domain.ResourceWithParents{
			Resource: domain.Resource{
				ResourceBase: domain.ResourceBase{
					ID: result.ID,
				},
				Name: &name,
				Type: result.Type,
			},
			Parents: parents,
		})
	}

	if err != nil {
		return nil, err
	}

	return resources, nil
}

func (store *psqlDatastore) GetResource(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	var resource domain.Resource

	if err := store.tx.Raw(`SELECT * FROM resource WHERE id = ?`, resourceID).Scan(&resource).Error; err != nil {
		return resource, err
	}

	if resource.ID == uuid.Nil {
		return resource, gorm.ErrRecordNotFound
	}

	return resource, nil
}

func (store *psqlDatastore) GetResourceWithLock(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	var resource domain.Resource

	if err := store.tx.Raw(`SELECT * FROM resource WHERE id = ? FOR UPDATE`, resourceID).Scan(&resource).Error; err != nil {
		return resource, err
	}

	if resource.ID == uuid.Nil {
		return resource, gorm.ErrRecordNotFound
	}

	return resource, nil
}

func (store *psqlDatastore) InsertResource(ctx context.Context, resource domain.Resource) error {
	return store.tx.Create(resource).Error
}

func (store *psqlDatastore) OrphanResource(ctx context.Context, resourceID uuid.UUID) error {
	return store.tx.Exec(`UPDATE resource SET leaf_of = NULL WHERE id = ?`, resourceID).Error
}

func (store *psqlDatastore) RenameResource(ctx context.Context, resourceID uuid.UUID, name, userID string) error {
	return store.tx.Exec(`UPDATE resource SET name = ?, mtime = ?, muser_id = ? WHERE id = ?`,
		name, time.Now(), userID, resourceID).Error
}

func (store *psqlDatastore) GetTreePath(ctx context.Context, resourceID uuid.UUID) (domain.Path, error) {
	var out struct {
		Path domain.Path `gorm:"column:path"`
	}

	if err := store.tx.Raw(`SELECT path::text AS path
		FROM tree
		WHERE resource_id = ?`, resourceID).Scan(&out).Error; err != nil {
		return nil, err
	}

	return out.Path, nil
}

func (store *psqlDatastore) InsertTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error {
	return store.tx.Exec(`INSERT INTO tree (resource_id, path)
		SELECT @resourceID, path || REPLACE(@resourceID, '-', '_')
		FROM tree
		WHERE resource_id = @parentID`, sql.Named("parentID", parentID), sql.Named("resourceID", resourceID)).Error
}

func (store *psqlDatastore) RemoveTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error {
	return store.tx.Exec(`DELETE FROM tree
		WHERE path <@ (SELECT path FROM tree WHERE resource_id = @parentID LIMIT 1) AND resource_id = @resourceID`,
		sql.Named("parentID", parentID), sql.Named("resourceID", resourceID)).Error
}

func (store *psqlDatastore) MoveSubtree(ctx context.Context, subtree domain.Path, newAncestralPath domain.Path) error {
	return store.tx.Exec(`UPDATE tree
		SET path = ? || subpath(path, ?)
		WHERE path <@ ?`, newAncestralPath, len(subtree)-1, subtree).Error
}

func (store *psqlDatastore) GetSubtreeLock(ctx context.Context, resourceID uuid.UUID) error {
	if err := store.tx.Exec(fmt.Sprintf(`%s
		SELECT * FROM (
			SELECT resource_id
			FROM tree
			INNER JOIN resource ON tree.resource_id = resource.id
			FOR UPDATE) t1
		UNION ALL
		SELECT * FROM (
			SELECT resource_id
			FROM tree
			INNER JOIN resource leaf ON tree.resource_id = leaf.leaf_of
			FOR UPDATE) t2`, withTreeQuery()), resourceID).Error; err != nil {
		return err
	}

	return nil
}

func (store *psqlDatastore) InsertTrash(ctx context.Context, trash domain.Trash) error {
	return store.tx.Create(&trash).Error
}

func (store *psqlDatastore) TouchResource(ctx context.Context, resourceID uuid.UUID, userID string) error {
	return store.tx.Exec(`UPDATE resource SET mtime = ?, muser_id = ? WHERE id = ?`,
		time.Now(), userID, resourceID).Error
}

func (store *psqlDatastore) UpdateCounters(ctx context.Context, resourceID uuid.UUID, delta domain.Counters) error {
	difference := delta.AsMap()

	if len(difference) == 0 {
		return nil
	}

	var param string = "counters"

	for counterType, count := range difference {
		param = fmt.Sprintf("jsonb_set(%s::jsonb, '{%s}', DIV((COALESCE((counters->>'%s')::int, 0) + %d), 1)::text::jsonb, true)", param, counterType, counterType, count)
	}

	query := fmt.Sprintf("UPDATE resource SET counters = %s WHERE id = ?", param)

	return store.tx.Exec(query, resourceID).Error
}

func (store *psqlDatastore) GetBolts(ctx context.Context, resourceID uuid.UUID) ([]domain.Bolt, error) {
	var bolts []domain.Bolt = make([]domain.Bolt, 0)

	query := fmt.Sprintf(`%s SELECT
		bolt.*,
		resource.counters,
		mf.name AS manufacturer,
		mo.name AS model,
		ma.name AS material
	FROM tree
	INNER JOIN resource ON tree.resource_id = resource.leaf_of
	INNER JOIN bolt ON resource.id = bolt.id
	LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
	LEFT JOIN model mo ON bolt.model_id = mo.id
	LEFT JOIN material ma ON bolt.material_id = ma.id`, withTreeQuery())

	if err := store.tx.Raw(query, resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}
func (store *psqlDatastore) GetBolt(ctx context.Context, resourceID uuid.UUID) (domain.Bolt, error) {
	var bolt domain.Bolt

	if err := store.tx.Raw(`SELECT
			bolt.*,
			resource.counters,
			mf.name AS manufacturer,
			mo.name AS model,
			ma.name AS material
		FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
		LEFT JOIN model mo ON bolt.model_id = mo.id
		LEFT JOIN material ma ON bolt.material_id = ma.id
		WHERE bolt.id = ?`, resourceID).
		Scan(&bolt).Error; err != nil {
		return bolt, err
	}

	if bolt.ID == uuid.Nil {
		return bolt, gorm.ErrRecordNotFound
	}

	return bolt, nil
}

func (store *psqlDatastore) GetBoltWithLock(ctx context.Context, resourceID uuid.UUID) (domain.Bolt, error) {
	var bolt domain.Bolt

	if err := store.tx.Raw(`SELECT * FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		WHERE bolt.id = ?
		FOR UPDATE`, resourceID).
		Scan(&bolt).Error; err != nil {
		return bolt, err
	}

	if bolt.ID == uuid.Nil {
		return bolt, gorm.ErrRecordNotFound
	}

	return bolt, nil
}

func (store *psqlDatastore) InsertBolt(ctx context.Context, bolt domain.Bolt) error {
	return store.tx.Create(bolt).Error
}

func (store *psqlDatastore) SaveBolt(ctx context.Context, bolt domain.Bolt) error {
	return store.tx.Select(
		"Type",
		"Position",
		"Installed",
		"Dismantled",
		"ManufacturerID",
		"ModelID",
		"MaterialID",
		"Diameter",
		"DiameterUnit").Updates(bolt).Error
}

func (store *psqlDatastore) GetAreas(ctx context.Context, resourceID uuid.UUID) ([]domain.Area, error) {
	var areas []domain.Area = make([]domain.Area, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN area ON tree.resource_id = area.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&areas).Error; err != nil {
		return nil, err
	}

	return areas, nil
}

func (store *psqlDatastore) GetArea(ctx context.Context, resourceID uuid.UUID) (domain.Area, error) {
	var area domain.Area

	if err := store.tx.Raw(`SELECT * FROM area INNER JOIN resource ON area.id = resource.id WHERE area.id = ?`, resourceID).
		Scan(&area).Error; err != nil {
		return domain.Area{}, err
	}

	if area.ID == uuid.Nil {
		return domain.Area{}, gorm.ErrRecordNotFound
	}

	return area, nil
}

func (store *psqlDatastore) InsertArea(ctx context.Context, area domain.Area) error {
	return store.tx.Create(&area).Error
}

func (store *psqlDatastore) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	var crags []domain.Crag = make([]domain.Crag, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN crag ON tree.resource_id = crag.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func (store *psqlDatastore) GetCrag(ctx context.Context, resourceID uuid.UUID) (domain.Crag, error) {
	var crag domain.Crag

	if err := store.tx.Raw(`SELECT * FROM crag INNER JOIN resource ON crag.id = resource.id WHERE crag.id = ?`, resourceID).
		Scan(&crag).Error; err != nil {
		return domain.Crag{}, err
	}

	if crag.ID == uuid.Nil {
		return domain.Crag{}, gorm.ErrRecordNotFound
	}

	return crag, nil
}

func (store *psqlDatastore) InsertCrag(ctx context.Context, crag domain.Crag) error {
	return store.tx.Create(&crag).Error
}

func (store *psqlDatastore) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	var manufacturers []domain.Manufacturer = make([]domain.Manufacturer, 0)

	query := "SELECT * FROM manufacturer ORDER BY name ASC"

	if err := store.tx.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}

func (store *psqlDatastore) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	var models []domain.Model = make([]domain.Model, 0)

	query := "SELECT * FROM model where manufacturer_id = ? ORDER BY name ASC"

	if err := store.tx.Raw(query, manufacturerID).Scan(&models).Error; err != nil {
		return nil, err
	}

	return models, nil
}

func (store *psqlDatastore) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	var materials []domain.Material = make([]domain.Material, 0)

	query := "SELECT * FROM material ORDER BY name ASC"

	if err := store.tx.Raw(query).Scan(&materials).Error; err != nil {
		return nil, err
	}

	return materials, nil
}

func (store *psqlDatastore) GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]domain.Route, error) {
	var routes []domain.Route = make([]domain.Route, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN route ON tree.resource_id = route.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&routes).Error; err != nil {
		return nil, err
	}

	return routes, nil
}

func (store *psqlDatastore) GetRoute(ctx context.Context, resourceID uuid.UUID) (domain.Route, error) {
	var route domain.Route

	if err := store.tx.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ?`, resourceID).
		Scan(&route).Error; err != nil {
		return domain.Route{}, err
	}

	if route.ID == uuid.Nil {
		return domain.Route{}, gorm.ErrRecordNotFound
	}

	return route, nil
}

func (store *psqlDatastore) GetRouteWithLock(resourceID uuid.UUID) (domain.Route, error) {
	var route domain.Route

	if err := store.tx.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ? FOR UPDATE`, resourceID).
		Scan(&route).Error; err != nil {
		return domain.Route{}, err
	}

	if route.ID == uuid.Nil {
		return domain.Route{}, gorm.ErrRecordNotFound
	}

	return route, nil
}

func (store *psqlDatastore) InsertRoute(ctx context.Context, route domain.Route) error {
	return store.tx.Create(route).Error
}

func (store *psqlDatastore) SaveRoute(ctx context.Context, route domain.Route) error {
	return store.tx.Select(
		"Name", "AltName", "Year", "Length", "RouteType").Updates(route).Error
}

func (store *psqlDatastore) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	var sectors []domain.Sector = make([]domain.Sector, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN sector ON tree.resource_id = sector.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func (store *psqlDatastore) GetSector(ctx context.Context, resourceID uuid.UUID) (domain.Sector, error) {
	var sector domain.Sector

	if err := store.tx.Raw(`SELECT * FROM sector INNER JOIN resource ON sector.id = resource.id WHERE sector.id = ?`, resourceID).
		Scan(&sector).Error; err != nil {
		return domain.Sector{}, err
	}

	if sector.ID == uuid.Nil {
		return domain.Sector{}, gorm.ErrRecordNotFound
	}

	return sector, nil
}

func (store *psqlDatastore) InsertSector(ctx context.Context, sector domain.Sector) error {
	return store.tx.Create(&sector).Error
}

func (store *psqlDatastore) GetTasks(ctx context.Context, resourceID uuid.UUID, pagination domain.Pagination, statuses []string) ([]domain.Task, domain.Meta, error) {
	var tasks []domain.Task = make([]domain.Task, 0)
	var meta domain.Meta = domain.Meta{}

	params := make([]interface{}, 1)
	params[0] = resourceID

	var where string = "TRUE"
	if len(statuses) > 0 {
		var placeholders []string = make([]string, 0)

		for _, status := range statuses {
			placeholders = append(placeholders, "?")
			params = append(params, status)
		}

		where = fmt.Sprintf("status IN (%s)", strings.Join(placeholders, ", "))
	}

	countQuery := fmt.Sprintf("%s SELECT COUNT(task.id) AS total_items FROM tree INNER JOIN resource ON tree.resource_id = resource.leaf_of INNER JOIN task ON resource.id = task.id WHERE %s", withTreeQuery(), where)

	dataQuery := fmt.Sprintf("%s SELECT * FROM tree INNER JOIN resource ON tree.resource_id = resource.leaf_of INNER JOIN task ON resource.id = task.id WHERE %s ORDER BY priority ASC %s", withTreeQuery(), where, paginationToSql(&pagination))

	if err := store.tx.Raw(dataQuery, params...).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := store.tx.Raw(countQuery, params...).Scan(&meta).Error; err != nil {
		return nil, meta, err
	}

	return tasks, meta, nil
}

func (store *psqlDatastore) GetTask(ctx context.Context, resourceID uuid.UUID) (domain.Task, error) {
	var task domain.Task

	if err := store.tx.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return domain.Task{}, err
	}

	if task.ID == uuid.Nil {
		return domain.Task{}, gorm.ErrRecordNotFound
	}

	return task, nil
}

func (store *psqlDatastore) GetTaskWithLock(resourceID uuid.UUID) (domain.Task, error) {
	var task domain.Task

	if err := store.tx.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ? FOR UPDATE`, resourceID).
		Scan(&task).Error; err != nil {
		return domain.Task{}, err
	}

	if task.ID == uuid.Nil {
		return domain.Task{}, gorm.ErrRecordNotFound
	}

	return task, nil
}

func (store *psqlDatastore) InsertTask(ctx context.Context, task domain.Task) error {
	return store.tx.Create(&task).Error
}

func (store *psqlDatastore) SaveTask(ctx context.Context, task domain.Task) error {
	return store.tx.Select(
		"Status",
		"Description",
		"Priority",
		"Comment",
		"ClosedAt",
	).Updates(task).Error
}

func (store *psqlDatastore) GetImages(ctx context.Context, resourceID uuid.UUID) ([]domain.Image, error) {
	var images []domain.Image = make([]domain.Image, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s
		SELECT * FROM tree
		INNER JOIN resource ON tree.resource_id = resource.leaf_of
		INNER JOIN image ON resource.id = image.id`, withTreeQuery()), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (store *psqlDatastore) GetImageWithLock(imageID uuid.UUID) (domain.Image, error) {
	var image domain.Image

	if err := store.tx.Raw(`SELECT * FROM image INNER JOIN resource ON image.id = resource.id WHERE image.id = ? FOR UPDATE`, imageID).
		Scan(&image).Error; err != nil {
		return domain.Image{}, err
	}

	if image.ID == uuid.Nil {
		return domain.Image{}, gorm.ErrRecordNotFound
	}

	return image, nil
}

func (store *psqlDatastore) GetImage(ctx context.Context, imageID uuid.UUID) (domain.Image, error) {
	var image domain.Image

	if err := store.tx.Raw(`SELECT * FROM image WHERE image.id = ?`, imageID).
		Scan(&image).Error; err != nil {
		return domain.Image{}, err
	}

	if image.ID == uuid.Nil {
		return domain.Image{}, gorm.ErrRecordNotFound
	}

	return image, nil
}

func (store *psqlDatastore) InsertImage(ctx context.Context, image domain.Image) error {
	return store.tx.Create(image).Error
}

func (store *psqlDatastore) SaveImage(ctx context.Context, image domain.Image) error {
	return store.tx.Select("Rotation").Updates(image).Error
}

func (store *psqlDatastore) GetPointConnections(ctx context.Context, routeID uuid.UUID) ([]domain.PointConnection, error) {
	var connections []domain.PointConnection = make([]domain.PointConnection, 0)

	err := store.tx.Raw(`
		SELECT connection.*
		FROM connection
		WHERE route_id = ?`, routeID).Scan(&connections).Error

	return connections, err
}

func (store *psqlDatastore) GetPointWithLock(ctx context.Context, pointID uuid.UUID) (domain.Point, error) {
	var point domain.Point

	if err := store.tx.Raw(`SELECT * FROM point INNER JOIN resource ON point.id = resource.id WHERE point.id = ? FOR UPDATE`, pointID).
		Scan(&point).Error; err != nil {
		return domain.Point{}, err
	}

	if point.ID == uuid.Nil {
		return domain.Point{}, gorm.ErrRecordNotFound
	}

	return point, nil
}

func (store *psqlDatastore) GetPoints(ctx context.Context, resourceID uuid.UUID) ([]domain.Point, error) {
	var points []domain.Point = make([]domain.Point, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN point ON tree.resource_id = point.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&points).Error; err != nil {
		return nil, err
	}

	return points, nil
}

func (store *psqlDatastore) InsertPoint(ctx context.Context, point domain.Point) error {
	return store.tx.Create(&point).Error
}

func (store *psqlDatastore) CreatePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return store.tx.Create(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (store *psqlDatastore) DeletePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return store.tx.Delete(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
