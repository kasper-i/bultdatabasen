package model

import (
	"errors"

	"gorm.io/gorm"
)

type Resource struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Name     *string `json:"name"`
	Type     string `json:"type"`
	Depth    int32 `json:"-"`
	ParentID *string `json:"-"`
}

func (Resource) TableName() string {
	return "resource"
}

type Level string

const (
	LvlArea         Level = "area"
	LvlCrag         Level = "crag"
	LvlSector       Level = "sector"
	LvlRoute        Level = "route"
	LvlInstallation Level = "installation"
)

func FindResourceByID(db *gorm.DB, resourceID string) (*Resource, error) {
	var resource Resource

	err := db.First(&resource, "id = ?", resourceID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	return &resource, nil
}

func GetDescendants(db *gorm.DB, resourceID string, downTo Level) []Resource {
	var descendants []Resource

	db.Raw(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT child.id, child.name, child.type, child.parent_id
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= 500
	)
	SELECT * FROM cte
	WHERE id <> ? AND type = ?`, resourceID, resourceID, string(downTo)).Scan(&descendants)

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
	WHERE id <> ?
	ORDER BY depth ASC`, resourceID, resourceID).Scan(&ancestors)

	return ancestors
}
