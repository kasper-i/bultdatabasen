package model

import (
	"errors"

	"gorm.io/gorm"
)

type Resource struct {
	ID       string  `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Depth    int32   `json:"-"`
	ParentID *string `json:"-"`
}

func (Resource) TableName() string {
	return "resource"
}

func (resource *Resource) SetDepth() {
	var depth int32

	switch resource.Type {
	case "area":
		depth = 100
	case "crag":
		depth = 200
	case "sector":
		depth = 300
	case "route":
		depth = 400
	case "installation":
		depth = 500
	}

	resource.Depth = depth
}

type Depth int32

const (
	DepthArea         Depth = 100
	DepthCrag         Depth = 200
	DepthSector       Depth = 300
	DepthRoute        Depth = 400
	DepthInstallation Depth = 500
)

func FindResourceByID(db *gorm.DB, resourceID string) (*Resource, error) {
	var resource Resource

	err := db.First(&resource, "id = ?", resourceID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	return &resource, nil
}

func GetDescendants(db *gorm.DB, resourceID string, downTo Depth) []Resource {
	var descendants []Resource

	db.Raw(`WITH RECURSIVE cte (id, name, depth, parent_id) AS (
		SELECT id, name, depth, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT child.id, child.name, child.depth, child.parent_id
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE child.depth <= ?
	)
	SELECT * FROM cte
	WHERE depth = ?`, resourceID, downTo, downTo).Scan(&descendants)

	return descendants
}

func GetAncestors(db *gorm.DB, resourceID string) []Resource {
	var ancestors []Resource

	db.Raw(`WITH RECURSIVE cte (id, name, type, depth, parent_id) AS (
		SELECT id, name, type, depth, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT parent.id, parent.name, parent.type, parent.depth, parent.parent_id
		FROM resource parent
		INNER JOIN cte ON parent.id=cte.parent_id
	)
	SELECT * FROM cte
	ORDER BY depth ASC`, resourceID, resourceID).Scan(&ancestors)

	return ancestors
}
