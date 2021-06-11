package model

import (
	"gorm.io/gorm"
)

const RootID = "7ea1df97-df3a-436b-b1d2-b211f1b9b363"

type Resource struct {
	ID       string  `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Depth    Depth   `json:"-"`
	ParentID *string `json:"parentId"`
}

func (Resource) TableName() string {
	return "resource"
}

type Depth int32

const (
	DepthArea   Depth = 100
	DepthCrag   Depth = 200
	DepthSector Depth = 300
	DepthRoute  Depth = 400
	DepthPoint  Depth = 500
)

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
	default:
		panic("illegal resource type")
	}
}

func GetAncestors(db *gorm.DB, resourceID string) ([]Resource, error) {
	var ancestors []Resource

	err := db.Raw(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
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
