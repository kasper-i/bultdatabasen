package repositories

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

func (store *psqlDatastore) GetAncestors(ctx context.Context, resourceID uuid.UUID) (domain.Ancestors, error) {
	ancestors := make([]domain.Resource, 0)

	err := store.tx(ctx).Raw(`WITH path_list AS (
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

	err := store.tx(ctx).Raw(`SELECT resource.* 
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

	err := store.tx(ctx).Raw(`SELECT id, name, type, tree.resource_id as child_id
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

	err := store.tx(ctx).Raw(`SELECT
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

	if err := store.tx(ctx).Raw(`SELECT * FROM resource WHERE id = ?`, resourceID).Scan(&resource).Error; err != nil {
		return resource, err
	}

	if resource.ID == uuid.Nil {
		return resource, gorm.ErrRecordNotFound
	}

	return resource, nil
}

func (store *psqlDatastore) GetResourceWithLock(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	var resource domain.Resource

	if err := store.tx(ctx).Raw(`SELECT * FROM resource WHERE id = ? FOR UPDATE`, resourceID).Scan(&resource).Error; err != nil {
		return resource, err
	}

	if resource.ID == uuid.Nil {
		return resource, gorm.ErrRecordNotFound
	}

	return resource, nil
}

func (store *psqlDatastore) InsertResource(ctx context.Context, resource domain.Resource) error {
	return store.tx(ctx).Create(resource).Error
}

func (store *psqlDatastore) OrphanResource(ctx context.Context, resourceID uuid.UUID) error {
	return store.tx(ctx).Exec(`UPDATE resource SET leaf_of = NULL WHERE id = ?`, resourceID).Error
}

func (store *psqlDatastore) RenameResource(ctx context.Context, resourceID uuid.UUID, name, userID string) error {
	return store.tx(ctx).Exec(`UPDATE resource SET name = ?, mtime = ?, muser_id = ? WHERE id = ?`,
		name, time.Now(), userID, resourceID).Error
}

func (store *psqlDatastore) TouchResource(ctx context.Context, resourceID uuid.UUID, userID string) error {
	return store.tx(ctx).Exec(`UPDATE resource SET mtime = ?, muser_id = ? WHERE id = ?`,
		time.Now(), userID, resourceID).Error
}

func (store *psqlDatastore) UpdateCounters(ctx context.Context, resourceID uuid.UUID, delta domain.Counters) error {
	difference := delta.AsMap()

	var param string = "counters"

	for counterType, count := range difference {
		param = fmt.Sprintf("jsonb_set(%s::jsonb, '{%s}', DIV((COALESCE((counters->>'%s')::int, 0) + %d), 1)::text::jsonb, true)", param, counterType, counterType, count)
	}

	query := fmt.Sprintf("UPDATE resource SET counters = %s WHERE id = ?", param)

	return store.tx(ctx).Exec(query, resourceID).Error
}
