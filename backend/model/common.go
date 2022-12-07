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
	return `WITH tree AS (SELECT * FROM tree WHERE path <@ (SELECT path FROM tree WHERE resource_id = ? LIMIT 1))`
}

func (sess Session) getResourceWithLock(resourceID uuid.UUID) (*Resource, error) {
	var resource Resource

	if err := sess.DB.Raw(`SELECT * FROM resource WHERE id = ? FOR UPDATE`, resourceID).Scan(&resource).Error; err != nil {
		return nil, err
	}

	return &resource, nil
}

func (sess Session) CreateResource(resource *Resource, parentResourceID uuid.UUID) error {
	resource.ID = uuid.New()

	resource.BirthTime = time.Now()
	resource.ModifiedTime = time.Now()

	resource.CreatorID = *sess.UserID
	resource.LastUpdatedByID = *sess.UserID

	switch resource.Type {
	case TypeRoot:
		return utils.ErrNotPermitted
	case TypeArea, TypeCrag, TypeSector, TypeRoute, TypePoint:
		if !sess.checkParentAllowed(*resource, parentResourceID) {
			return utils.ErrHierarchyStructureViolation
		}

		resource.LeafOf = nil
	default:
		if resource.LeafOf == nil {
			return utils.ErrOrphanedResource
		}
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Create(&resource).Error; err != nil {
			return err
		}

		switch resource.Type {
		case TypeArea, TypeCrag, TypeSector, TypeRoute, TypePoint:
			subtree, err := sess.GetPath(parentResourceID)
			if err != nil {
				return err
			}

			return sess.DB.Exec(`INSERT INTO tree (resource_id, path)
				VALUES (?, ?)`, resource.ID, subtree.Add(resource.ID)).Error
		}

		return nil
	})

	return err
}

func (sess Session) TouchResource(resourceID uuid.UUID) error {
	return sess.DB.Exec(`UPDATE resource SET mtime = ?, muser_id = ? WHERE id = ?`,
		time.Now(), sess.UserID, resourceID).Error
}

func (sess Session) DeleteResource(resourceID uuid.UUID) error {
	ancestors, err := sess.GetAncestors(resourceID)
	if err != nil {
		return err
	}

	trash := Trash{
		ResourceID:   resourceID,
		DeletedTime:  time.Now(),
		DeletedByID:  *sess.UserID,
	}

	err = sess.Transaction(func(sess Session) error {
		err := sess.getSubtreeLock(resourceID)
		if err != nil {
			return err
		}

		resource, err := sess.getResourceWithLock(resourceID)
		if err != nil {
			return err
		}

		switch resource.Type {
		case TypeRoot:
			return utils.ErrNotPermitted
		case TypeArea, TypeCrag, TypeSector, TypeRoute, TypePoint:
			subtree, err := sess.GetPath(resourceID)
			if err != nil {
				return err
			}

			if err := sess.DB.Exec(`UPDATE tree
				SET path = subpath(path, ?)
				WHERE path <@ ?`, len(subtree)-1, subtree).Error; err != nil {
				return err
			}

			trash.OrigPath = &subtree
		default:
			trash.OrigLeafOf = resource.LeafOf
			resource.LeafOf = nil

			if err := sess.DB.Select("LeafOf").Updates(resource).Error; err != nil {
				return err
			}
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
	case TypeArea:
		return pt == TypeRoot || pt == TypeArea
	case TypeCrag:
		return pt == TypeArea
	case TypeSector:
		return pt == TypeCrag
	case TypeRoute:
		return pt == TypeArea || pt == TypeCrag || pt == TypeSector
	case TypePoint:
		return pt == TypeRoute
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
