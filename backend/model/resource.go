package model

import (
	"bultdatabasen/utils"
	"database/sql/driver"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

const RootID = "7ea1df97-df3a-436b-b1d2-b211f1b9b363"

type ResourceType string

const (
	TypeRoot    ResourceType = "root"
	TypeArea                 = "area"
	TypeCrag                 = "crag"
	TypeSector               = "sector"
	TypeRoute                = "route"
	TypePoint                = "point"
	TypeBolt                 = "bolt"
	TypeImage                = "image"
	TypeComment              = "comment"
	TypeTask                 = "task"
)

type ResourceBase struct {
	ID        uuid.UUID   `gorm:"primaryKey" json:"id"`
	Ancestors *[]Resource `gorm:"-" json:"ancestors,omitempty"`
	Counters  Counters    `gorm:"->" json:"counters"`
}

type Resource struct {
	ResourceBase
	Name            *string      `json:"name,omitempty"`
	Type            ResourceType `json:"type"`
	LeafOf          *uuid.UUID   `json:"leafOf,omitempty"`
	BirthTime       time.Time    `gorm:"column:btime" json:"-"`
	ModifiedTime    time.Time    `gorm:"column:mtime" json:"-"`
	CreatorID       string       `gorm:"column:buser_id" json:"-"`
	LastUpdatedByID string       `gorm:"column:muser_id" json:"-"`
}

type ResourcePatch struct {
	ParentID uuid.UUID `json:"parentId"`
}

type Trash struct {
	ResourceID  uuid.UUID `gorm:"primaryKey"`
	DeletedTime time.Time `gorm:"column:dtime"`
	DeletedByID string    `gorm:"column:duser_id"`
	OrigPath    *Path
	OrigLeafOf  *uuid.UUID
}

type Parent struct {
	ID           uuid.UUID    `json:"id"`
	Name         *string      `json:"name"`
	Type         ResourceType `json:"type"`
	ChildID      uuid.UUID    `json:"-"`
	FosterParent bool         `json:"-"`
}

type ResourceWithParents struct {
	Resource
	Parents []Parent `json:"parents"`
}

type Path []uuid.UUID

func (path Path) Value() (driver.Value, error) {
	parts := make([]string, len(path))

	for idx, resourceID := range path {
		parts[idx] = strings.ReplaceAll(resourceID.String(), "-", "_")
	}

	return strings.Join(parts, "."), nil
}

func (out *Path) Scan(value interface{}) error {
	s := strings.Split(value.(string), ".")
	path := make([]uuid.UUID, len(s))

	for idx, lvl := range s {
		if val, err := uuid.Parse(strings.ReplaceAll(lvl, "_", "-")); err != nil {
			return err
		} else {
			path[idx] = val
		}
	}

	*out = path
	return nil
}

func (self Path) Parent() uuid.UUID {
	return self[len(self)-2]
}

func (self Path) Root() uuid.UUID {
	return self[0]
}

func (self Path) Add(id uuid.UUID) Path {
	return append(self, id)
}

func (Resource) TableName() string {
	return "resource"
}

func (Trash) TableName() string {
	return "trash"
}

func (resource *ResourceBase) WithAncestors(r *http.Request) {

	if value, ok := r.Context().Value("ancestors").([]Resource); ok {
		resource.Ancestors = &value
	}
}

func (sess Session) GetResource(resourceID uuid.UUID) (*Resource, error) {
	var resource Resource

	if err := sess.DB.First(&resource, "id = ?", resourceID).Error; err != nil {
		return nil, err
	}

	return &resource, nil
}

func (sess Session) Move(resourceID, newParentID uuid.UUID) error {
	var resource *Resource
	var subtree Path
	var err error
	var oldParentID uuid.UUID

	return sess.Transaction(func(sess Session) error {
		if err := sess.getSubtreeLock(resourceID); err != nil {
			return err
		}

		if subtree, err = sess.GetPath(resourceID); err != nil {
			return err
		} else {
			oldParentID = subtree.Parent()
		}

		if oldParentID == newParentID {
			return utils.ErrHierarchyStructureViolation
		}

		if resource, err = sess.GetResource(resourceID); err != nil {
			return err
		}

		switch resource.Type {
		case TypeArea, TypeCrag, TypeSector, TypeRoute:
			break
		default:
			return utils.ErrMoveNotPermitted
		}

		if !sess.checkParentAllowed(*resource, newParentID) {
			return utils.ErrHierarchyStructureViolation
		}

		if err := sess.updateCountersForResourceAndAncestors(oldParentID, Counters{}.Substract(resource.Counters)); err != nil {
			return err
		}

		var newParent struct {
			Path string `gorm:"column:path"`
			Type string `gorm:"column:type"`
		}

		if err := sess.DB.Raw(`SELECT path, type
			FROM tree
			INNER JOIN resource ON tree.resource_id = resource.id
			WHERE resource_id = ? AND path <@ ?`, newParentID, strings.ReplaceAll(RootID, "-", "_")).Scan(&newParent).Error; err != nil {
			return err
		}

		if err := sess.DB.Exec(`UPDATE tree
			SET path = ? || subpath(path, nlevel(?) - 1)
			WHERE path <@ ?`, newParent.Path, subtree, subtree).Error; err != nil {
			return err
		}

		return sess.updateCountersForResourceAndAncestors(newParentID, resource.Counters)
	})
}

func (sess Session) getSubtreeLock(resourceID uuid.UUID) error {
	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT id
		FROM tree
		INNER JOIN resource ON tree.resource_id = resource.id
		LEFT JOIN resource ON tree.resource_id = resource.leaf_of
		FOR UPDATE`, withTreeQuery()), resourceID).Error; err != nil {
		return err
	}

	return nil
}

func (sess Session) GetPath(resourceID uuid.UUID) (Path, error) {
	var out struct {
		Path Path `gorm:"column:path"`
	}

	if err := sess.DB.Raw(`SELECT path::text AS path
		FROM tree
		WHERE resource_id = ?`, resourceID).Scan(&out).Error; err != nil {
		return nil, err
	}

	return out.Path, nil
}

func (sess Session) GetAncestors(resourceID uuid.UUID) ([]Resource, error) {
	var ancestors []Resource

	err := sess.DB.Raw(`WITH ancestor AS (
		SELECT unnest(string_to_array(CASE WHEN nlevel(COALESCE(t1.path, '')) > nlevel(COALESCE(t2.path, '')) THEN t1.path::text ELSE t2.path::text END, '.')) AS id FROM resource
		LEFT JOIN tree t1 ON resource.id = t1.resource_id
		LEFT JOIN tree t2 ON resource.leaf_of = t2.resource_id
		WHERE id = ?
	)
	SELECT DISTINCT ON (resource.id) resource.id, name, type, REPLACE(subpath(path, -2, 1)::text, '_', '-')::uuid AS parent_id
	FROM ancestor
	INNER JOIN resource ON resource.id = REPLACE(ancestor.id, '_', '-')::uuid
	INNER JOIN tree ON resource.id = tree.resource_id
	WHERE resource.id <> ?::uuid`, resourceID, resourceID).Scan(&ancestors).Error

	if err != nil {
		return nil, err
	}

	return ancestors, nil
}

func (sess Session) GetChildren(resourceID uuid.UUID) ([]Resource, error) {
	var children []Resource = make([]Resource, 0)

	err := sess.DB.Raw(`SELECT resource.* 
	FROM tree
	INNER JOIN resource ON tree.resource_id = resource.id
	WHERE path ~ ?
	ORDER BY name`, fmt.Sprintf("*.%s.*{1}", strings.ReplaceAll(resourceID.String(), "-", "_"))).Scan(&children).Error

	if err != nil {
		return nil, err
	}

	return children, nil
}

func parseString(value interface{}) *string {
	if str, ok := value.(string); ok {
		return &str
	} else {
		return nil
	}
}

func (sess Session) Search(name string) ([]ResourceWithParents, error) {
	var results []map[string]interface{}
	var resources []ResourceWithParents = make([]ResourceWithParents, 0)

	err := sess.DB.Raw(`SELECT
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
		strings.ReplaceAll(RootID, "-", "_")).Scan(&results).Error

	for _, result := range results {
		parents := make([]Parent, 0)

		if result["r2_id"] != nil {
			parents = append(parents, Parent{
				ID:   result["r2_id"].(uuid.UUID),
				Name: parseString(result["r2_name"]),
				Type: result["r2_type"].(ResourceType),
			})
		}

		if result["r3_id"] != nil {
			parents = append(parents, Parent{
				ID:   result["r3_id"].(uuid.UUID),
				Name: parseString(result["r3_name"]),
				Type: result["r3_type"].(ResourceType),
			})
		}

		resources = append(resources, ResourceWithParents{
			Resource: Resource{
				ResourceBase: ResourceBase{
					ID: result["id"].(uuid.UUID),
				},
				Name: parseString(result["name"]),
				Type: result["type"].(ResourceType),
			},
			Parents: parents,
		})
	}

	if err != nil {
		return nil, err
	}

	return resources, nil
}

func (sess Session) updateCountersForResourceAndAncestors(resourceID uuid.UUID, delta Counters) error {
	ancestors, err := sess.GetAncestors(resourceID)
	if err != nil {
		return err
	}

	resourceIDs := append(utils.Map(ancestors, func(ancestor Resource) uuid.UUID { return ancestor.ID }), resourceID)

	for _, resourceID := range resourceIDs {
		if err := sess.updateCountersForResource(resourceID, delta); err != nil {
			return err
		}
	}

	return nil
}

func (sess Session) updateCountersForResource(resourceID uuid.UUID, delta Counters) error {
	difference := delta.AsMap()

	if len(difference) == 0 {
		return nil
	}

	var param string = "counters"

	for counterType, count := range difference {
		param = fmt.Sprintf("jsonb_set(%s::jsonb, '{%s}', DIV((COALESCE((counters->>'%s')::int, 0) + %d), 1)::text::jsonb, true)", param, counterType, counterType, count)
	}

	query := fmt.Sprintf("UPDATE resource SET counters = %s WHERE id = ?", param)

	return sess.DB.Exec(query, resourceID).Error
}
