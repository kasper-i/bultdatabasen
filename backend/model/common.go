package model

import (
	"bultdatabasen/utils"
	"fmt"

	"gorm.io/gorm"
)

func getDescendantsQuery(resourceType string) string {
	return fmt.Sprintf(`WITH RECURSIVE cte (id, name, type, parent_id, first) AS (
		SELECT id, name, type, parent_id, TRUE
		FROM resource
		WHERE id = ?
	UNION
		SELECT child.id, child.name, child.type, child.parent_id, FALSE
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= %d
	UNION
		SELECT child.id, child.name, child.type, child.parent_id, FALSE
		FROM foster_care f
		INNER JOIN cte ON f.foster_parent_id = cte.id
		INNER JOIN resource child ON child.id = f.id
	)
	SELECT %s.*, cte.name, cte.parent_id FROM cte
	INNER JOIN %s ON cte.id = %s.id
	WHERE cte.first <> TRUE`, GetResourceDepth(resourceType), resourceType, resourceType, resourceType)
}

func createResource(tx *gorm.DB, resource Resource) error {
	resource.Depth = GetResourceDepth(resource.Type)

	if resource.ParentID == nil {
		return utils.ErrOrphanedResource
	}

	if !checkParentAllowed(tx, resource, *resource.ParentID) {
		return utils.ErrHierarchyStructureViolation
	}

	return tx.Create(&resource).Error
}

func moveResource(tx *gorm.DB, resource Resource, newParentID string) error {
	if !checkParentAllowed(tx, resource, newParentID) {
		return utils.ErrHierarchyStructureViolation
	}

	return tx.Exec(`UPDATE resource SET parent_id = ? WHERE id = ?`, newParentID, resource.ID).Error
}

func checkParentAllowed(tx *gorm.DB, resource Resource, parentID string) bool {
	var parentResource Resource

	if err := tx.First(&parentResource, "id = ?", parentID).Error; err != nil {
		return false
	}

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
	case "image":
		return pt == "point"
	case "comment":
		return pt == "point"
	case "task":
		return pt == "area" || pt == "crag" || pt == "sector" || pt == "route" || pt == "point"
	default:
		return false
	}
}

func checkSameParent(tx *gorm.DB, resourceID1, resourceID2 string) bool {
	var parents []Resource = make([]Resource, 0)

	if err := tx.Raw(`SELECT parent.*
		FROM resource
		LEFT JOIN resource parent ON resource.parent_id = parent.id
		WHERE resource.id IN (?, ?)`, resourceID1, resourceID2).Scan(&parents).Error; err != nil {
		return false
	}

	if len(parents) != 2 {
		return false
	}

	return parents[0].ID == parents[1].ID
}

func addFosterParent(tx *gorm.DB, resource Resource, fosterParentID string) error {
	if resource.ParentID == nil {
		return utils.ErrOrphanedResource
	}

	if !checkSameParent(tx, fosterParentID, *resource.ParentID) {
		return utils.ErrHierarchyStructureViolation
	}

	return tx.Exec(`INSERT INTO foster_care (id, foster_parent_id) VALUES (?, ?)`,
		resource.ID, fosterParentID).Error
}

func leaveFosterCare(tx *gorm.DB, resourceID, fosterParentID string) error {
	return tx.Exec(`DELETE FROM foster_care WHERE id = ? AND foster_parent_id = ?`, resourceID, fosterParentID).Error
}
