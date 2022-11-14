package model

import (
	"bultdatabasen/utils"
	"fmt"
	"net/http"
	"time"

	"gorm.io/gorm"
)

const RootID = "7ea1df97-df3a-436b-b1d2-b211f1b9b363"

type ResourceBase struct {
	ID        string      `gorm:"primaryKey" json:"id"`
	Ancestors *[]Resource `gorm:"-" json:"ancestors,omitempty"`
	Counters  Counters    `gorm:"->" json:"counters"`
}

type Resource struct {
	ResourceBase
	Name            *string   `json:"name,omitempty"`
	Type            string    `json:"type"`
	Depth           Depth     `json:"-"`
	ParentID        *string   `json:"parentId,omitempty"`
	BirthTime       time.Time `gorm:"column:btime" json:"-"`
	ModifiedTime    time.Time `gorm:"column:mtime" json:"-"`
	CreatorID       string    `gorm:"column:buser_id" json:"-"`
	LastUpdatedByID string    `gorm:"column:muser_id" json:"-"`
}

type ResourcePatch struct {
	ParentID *string `json:"parentId"`
}

type Trash struct {
	ResourceID   string    `gorm:"primaryKey"`
	DeletedTime  time.Time `gorm:"column:dtime"`
	DeletedByID  string    `gorm:"column:duser_id"`
	OrigParentID string
}

type Parent struct {
	ID           string  `json:"id"`
	Name         *string `json:"name"`
	Type         string  `json:"type"`
	ChildID      *string `json:"-"`
	FosterParent bool    `json:"-"`
}

type ResourceWithParents struct {
	Resource
	Parents []Parent `json:"parents"`
}

func (Resource) TableName() string {
	return "resource"
}

func (Trash) TableName() string {
	return "trash"
}

type Depth int32

const (
	DepthArea    Depth = 100
	DepthCrag    Depth = 200
	DepthSector  Depth = 300
	DepthRoute   Depth = 400
	DepthPoint   Depth = 500
	DepthBolt    Depth = 600
	DepthImage   Depth = 700
	DepthComment Depth = 700
	DepthTask    Depth = 700
)

func (resource *ResourceBase) WithAncestors(r *http.Request) {

	if value, ok := r.Context().Value("ancestors").([]Resource); ok {
		resource.Ancestors = &value
	}
}

func GetResourceDepth(resourceType string) Depth {
	switch resourceType {
	case "area":
		return DepthArea
	case "crag":
		return DepthCrag
	case "sector":
		return DepthSector
	case "route":
		return DepthRoute
	case "point":
		return DepthPoint
	case "bolt":
		return DepthBolt
	case "image":
		return DepthImage
	case "comment":
		return DepthComment
	case "task":
		return DepthTask
	default:
		panic("illegal resource type")
	}
}

func (sess Session) GetResource(resourceID string) (*Resource, error) {
	var resource Resource

	if err := sess.DB.First(&resource, "id = ?", resourceID).Error; err != nil {
		return nil, err
	}

	return &resource, nil
}

func (sess Session) MoveResource(resourceID, newParentID string) error {
	var resource *Resource
	var err error

	return sess.Transaction(func(sess Session) error {
		if resource, err = sess.getResourceWithLock(resourceID); err != nil {
			return err
		}

		switch resource.Type {
		case "area", "crag", "sector":
			break
		default:
			return utils.ErrMoveNotPermitted
		}

		oldParentID := *resource.ParentID

		if oldParentID == newParentID {
			return nil
		}

		if err := sess.updateCountersForResourceAndAncestors(oldParentID, Counters{}.Substract(resource.Counters)); err != nil {
			return err
		}

		if err := sess.moveResource(*resource, newParentID); err != nil {
			return err
		}

		return sess.updateCountersForResourceAndAncestors(newParentID, resource.Counters)
	})
}

func (sess Session) getResourceWithLock(resourceID string) (*Resource, error) {
	var resource Resource

	if err := sess.DB.Raw(`SELECT * FROM resource WHERE id = ? FOR UPDATE`, resourceID).
		Scan(&resource).Error; err != nil {
		return nil, err
	}

	if resource.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &resource, nil
}

func (sess Session) GetAncestors(resourceID string) ([]Resource, error) {
	var ancestors []Resource

	err := sess.DB.Raw(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT parent.id, parent.name, parent.type, parent.parent_id
		FROM resource parent
		INNER JOIN cte ON parent.id=cte.parent_id
	)
	SELECT * FROM cte
	WHERE id != ?`, resourceID, resourceID).Scan(&ancestors).Error

	if err != nil {
		return nil, err
	}

	return ancestors, nil
}

func (sess Session) GetAncestorsIncludingFosterParents(resourceID string) ([]Resource, error) {
	var ancestors []Resource

	err := sess.DB.Raw(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION
		SELECT * FROM (
			WITH cte_inner AS (
				SELECT * FROM cte
			)
			SELECT parent.id, parent.name, parent.type, parent.parent_id
				FROM resource parent
				INNER JOIN cte_inner ON parent.id=cte_inner.parent_id
			UNION DISTINCT
				SELECT foster_parent.id, foster_parent.name, foster_parent.type, foster_parent.parent_id
				FROM foster_care fc
				INNER JOIN cte_inner ON fc.id=cte_inner.id
				INNER JOIN resource foster_parent ON fc.foster_parent_id=foster_parent.id
		) r
	)
	SELECT * FROM cte
	WHERE id != ?`, resourceID, resourceID).Scan(&ancestors).Error

	if err != nil {
		return nil, err
	}

	return ancestors, nil
}

func (sess Session) GetChildren(resourceID string) ([]Resource, error) {
	var children []Resource = make([]Resource, 0)

	err := sess.DB.Raw(`SELECT * FROM resource
	WHERE parent_id = ?
	ORDER BY name`, resourceID).Scan(&children).Error

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
	INNER JOIN resource r2 ON r1.parent_id = r2.id
	LEFT JOIN resource r3 ON r2.parent_id = r3.id
	WHERE r1.name LIKE ?
	LIMIT 20`, fmt.Sprintf("%%%s%%", name)).Scan(&results).Error

	for _, result := range results {
		parents := make([]Parent, 0)

		if result["r2_id"] != nil {
			parents = append(parents, Parent{
				ID:   result["r2_id"].(string),
				Name: parseString(result["r2_name"]),
				Type: result["r2_type"].(string),
			})
		}

		if result["r3_id"] != nil {
			parents = append(parents, Parent{
				ID:   result["r3_id"].(string),
				Name: parseString(result["r3_name"]),
				Type: result["r3_type"].(string),
			})
		}

		resources = append(resources, ResourceWithParents{
			Resource: Resource{
				ResourceBase: ResourceBase{
					ID: result["id"].(string),
				},
				Name:     parseString(result["name"]),
				Type:     result["type"].(string),
				ParentID: parseString(result["parent_id"])},
			Parents: parents,
		})
	}

	if err != nil {
		return nil, err
	}

	return resources, nil
}

func (sess Session) updateCountersForResourceAndAncestors(resourceID string, delta Counters) error {
	ancestors, err := sess.GetAncestorsIncludingFosterParents(resourceID)
	if err != nil {
		return err
	}

	resourceIDs := append(utils.Map(ancestors, func(ancestor Resource) string { return ancestor.ID }), resourceID)

	for _, resourceID := range resourceIDs {
		if err := sess.updateCountersForResource(resourceID, delta); err != nil {
			return err
		}
	}

	return nil
}

func (sess Session) updateCountersForResource(resourceID string, delta Counters) error {
	difference := delta.AsMap()

	if len(difference) == 0 {
		return nil
	}

	var param string = "counters"

	for counterType, count := range difference {
		param = fmt.Sprintf("jsonb_set(%s::jsonb, '{%s}', DIV((COALESCE((counters->>'%s')::int, 0) + %d), 1)::text::jsonb, true)", param, counterType, counterType, count)
	}

	query := fmt.Sprintf("UPDATE resource SET counters = %s WHERE id = ? AND parent_id IS NOT NULL", param)

	return sess.DB.Exec(query, resourceID).Error
}
