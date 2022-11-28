package model

import (
	"bultdatabasen/utils"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	DB     *gorm.DB
	UserID *string
}

func NewSession(db *gorm.DB, userID *string) Session {
	return Session{DB: db, UserID: userID}
}

func (sess Session) Transaction(fn func(sess Session) error) error {
	return sess.DB.Transaction(func(tx *gorm.DB) error {
		sess := NewSession(tx, sess.UserID)
		return fn(sess)
	})
}

func withTreeQuery() string {
	return `WITH tree AS (SELECT * FROM tree WHERE path <@ (SELECT path FROM tree WHERE resource_id = ? LIMIT 1))`;
}

func (sess Session) createResource(resource Resource) error {
	if resource.LeafOf == uuid.Nil {
		return utils.ErrOrphanedResource
	}

	if !sess.checkParentAllowed(resource, resource.LeafOf) {
		return utils.ErrHierarchyStructureViolation
	}

	resource.BirthTime = time.Now()
	resource.ModifiedTime = time.Now()

	resource.CreatorID = *sess.UserID
	resource.LastUpdatedByID = *sess.UserID

	return sess.DB.Create(&resource).Error
}

func (sess Session) touchResource(resourceID uuid.UUID) error {
	return sess.DB.Exec(`UPDATE resource SET mtime = ?, muser_id = ? WHERE id = ?`,
		time.Now(), sess.UserID, resourceID).Error
}

func (sess Session) deleteResource(resourceID uuid.UUID) error {
	ancestors, err := sess.GetAncestors(resourceID)
	if err != nil {
		return err
	}

	err = sess.Transaction(func(sess Session) error {
		err := sess.getSubtreeLock(resourceID)
		if err != nil {
			return err
		}

		var resource Resource

		trash := Trash{
			ResourceID:   resource.ID,
			DeletedTime:  time.Now(),
			DeletedByID:  *sess.UserID,
			OrigParentID: resource.LeafOf,
		}

		resource.LeafOf = uuid.Nil

		if err := sess.DB.Select("ParentID").Updates(resource).Error; err != nil {
			return err
		}

		countersDifference := Counters{}.Substract(resource.Counters)

		for _, ancestor := range ancestors {
			if err := sess.updateCountersForResource(ancestor.ID, countersDifference); err != nil {
				return err
			}
		}

		return sess.DB.Create(&trash).Error
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) checkParentAllowed(resource Resource, parentID uuid.UUID) bool {
	var parentResource Resource

	if err := sess.DB.First(&parentResource, "id = ?", parentID).Error; err != nil {
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
		return pt == "route" || pt == "point"
	default:
		return false
	}
}

func (sess Session) checkSameParent(resourceID1, resourceID2 uuid.UUID) bool {
	var parents []Resource = make([]Resource, 0)

	if err := sess.DB.Raw(`SELECT parent.*
		FROM resource
		INNER JOIN resource parent ON resource.parent_id = parent.id
		WHERE resource.id IN (?, ?)`, resourceID1, resourceID2).Scan(&parents).Error; err != nil {
		return false
	}

	if len(parents) != 2 {
		return false
	}

	return parents[0].ID == parents[1].ID
}

func (sess Session) addFosterParent(resource Resource, fosterParentID uuid.UUID) error {
	if resource.LeafOf == uuid.Nil {
		return utils.ErrOrphanedResource
	}

	if !sess.checkSameParent(fosterParentID, resource.LeafOf) {
		return utils.ErrHierarchyStructureViolation
	}

	return sess.DB.Exec(`INSERT INTO foster_care (id, foster_parent_id) VALUES (?, ?)`,
		resource.ID, fosterParentID).Error
}

func (sess Session) leaveFosterCare(resourceID, fosterParentID uuid.UUID) error {
	return sess.DB.Exec(`DELETE FROM foster_care WHERE id = ? AND foster_parent_id = ?`, resourceID, fosterParentID).Error
}
