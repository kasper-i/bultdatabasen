package model

import (
	"bultdatabasen/utils"
	"fmt"

	"gorm.io/gorm"
)

func getDescendantsQuery(resourceType string) string {
	return fmt.Sprintf(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT child.id, child.name, child.type, child.parent_id
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= %d
	)
	SELECT %s.*, cte.name, cte.parent_id FROM cte
	INNER JOIN %s ON cte.id = %s.id`, GetResourceDepth(resourceType), resourceType, resourceType, resourceType)
}

func createResource(tx *gorm.DB, resource Resource) error {
	resource.Depth = GetResourceDepth(resource.Type)

	var parentResource Resource

	if err := tx.First(&parentResource, "id = ?", resource.ParentID).Error; err != nil {
		return err
	}

	if !checkParent(resource, parentResource) {
		return utils.ErrIllegalParentResource
	}

	return tx.Create(&resource).Error
}

func checkParent(resource, parentResource Resource) bool {
	pt := parentResource.Type

	switch resource.Type {
	case "area":
		return pt == "root" || pt == "area"
	case "crag":
		return pt == "area"
	case "sector":
		return pt == "crag"
	case "route":
		return pt == "area" || pt == "crag" || pt == "sector"
	case "point":
		return pt == "route"
	case "bolt":
		return pt == "point"
	default:
		return false
	}
}
