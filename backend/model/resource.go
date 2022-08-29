package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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

func (counters *Counters) Scan(value interface{}) error {
	bytes := value.([]byte)
	err := json.Unmarshal(bytes, counters)
	return err
}

func (counters Counters) Value() (driver.Value, error) {
	return json.Marshal(counters)
}

func (counters Counters) GetCount(counterType CounterType) int {
	var match *int

	switch counterType {
	case OpenTasks:
		match = counters.OpenTasks
	}

	if match != nil {
		return *match
	}

	return 0
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

type ResourceCount struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
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

func (sess Session) GetAllAncestorsWithCounters(resourceID string) ([]Resource, error) {
	var ancestors []Resource

	err := sess.DB.Raw(`WITH RECURSIVE cte (id, name, type, parent_id, counters) AS (
		SELECT id, name, type, parent_id, counters
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT parent.id, parent.name, parent.type, parent.parent_id, parent.counters
		FROM resource parent
		INNER JOIN cte ON parent.id=cte.parent_id
	UNION DISTINCT
		SELECT foster_parent.id, foster_parent.name, foster_parent.type, foster_parent.parent_id, foster_parent.counters
		FROM foster_care fc
		INNER JOIN cte ON fc.id=cte.id
		INNER JOIN resource foster_parent ON fc.foster_parent_id=foster_parent.id
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
	ORDER BY JSON_EXTRACT(counters, '$.openTasks') DESC`, resourceID).Scan(&children).Error

	if err != nil {
		return nil, err
	}

	return children, nil
}

func (sess Session) GetCounts(resourceID string) ([]ResourceCount, error) {
	var counts []ResourceCount = make([]ResourceCount, 0)

	err := sess.DB.Raw(`WITH RECURSIVE cte (id, type, parent_id, first) AS (
		SELECT id, type, parent_id, TRUE
		FROM resource
		WHERE id = ?
	UNION
		SELECT child.id, child.type, child.parent_id, FALSE
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= ?
	)
	SELECT cte.type, COUNT(cte.type) AS count FROM cte
	WHERE cte.first <> TRUE
	GROUP BY cte.type`, resourceID, DepthBolt).Scan(&counts).Error

	if err != nil {
		return nil, err
	}

	return counts, nil
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
	LEFT JOIN resource r2 ON r1.parent_id = r2.id
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

func (sess Session) CountOpenTasks(resourceID string) (int, error) {
	var count struct {
		TotalItems int `gorm:"column:totalItems" json:"totalItems"`
	}

	countQuery := fmt.Sprintf("%s AND %s", buildDescendantsCountQuery("task"), "task.status IN ('open', 'assigned')")

	if err := sess.DB.Raw(countQuery, resourceID).Scan(&count).Error; err != nil {
		return 0, err
	}

	return count.TotalItems, nil
}

func (sess Session) CountInstalledBolts(resourceID string) (int, error) {
	var count struct {
		TotalItems int `gorm:"column:totalItems" json:"totalItems"`
	}

	countQuery := fmt.Sprintf("%s AND %s", buildDescendantsCountQuery("bolt"), "dismantled IS NULL")

	if err := sess.DB.Raw(countQuery, resourceID).Scan(&count).Error; err != nil {
		return 0, err
	}

	return count.TotalItems, nil
}

func (sess Session) UpdateCount(resourceID string, counterType CounterType, count int) error {
	query := "UPDATE resource SET counters = JSON_SET(counters, ?, ?) WHERE id = ?"

	if err := sess.DB.Exec(query, fmt.Sprintf("$.%s", counterType), count, resourceID).Error; err != nil {
		return err
	}

	return nil
}
