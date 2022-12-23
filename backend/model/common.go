package model

import (
	"bultdatabasen/domain"
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

func (sess Session) getResourceWithLock(resourceID uuid.UUID) (*domain.Resource, error) {
	var resource domain.Resource

	if err := sess.DB.Raw(`SELECT * FROM resource WHERE id = ? FOR UPDATE`, resourceID).Scan(&resource).Error; err != nil {
		return nil, err
	}

	if resource.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &resource, nil
}

func (sess Session) CreateResource(resource *domain.Resource, parentResourceID uuid.UUID) error {
	resource.ID = uuid.New()

	resource.BirthTime = time.Now()
	resource.ModifiedTime = time.Now()

	resource.CreatorID = *sess.UserID
	resource.LastUpdatedByID = *sess.UserID

	switch resource.Type {
	case domain.TypeRoot:
		return utils.ErrNotPermitted
	case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
		resource.LeafOf = nil
	default:
		resource.LeafOf = &parentResourceID
	}

	if !sess.checkParentAllowed(*resource, parentResourceID) {
		return utils.ErrHierarchyStructureViolation
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Create(&resource).Error; err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
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

	trash := domain.Trash{
		ResourceID:  resourceID,
		DeletedTime: time.Now(),
		DeletedByID: *sess.UserID,
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
		case domain.TypeRoot:
			return utils.ErrNotPermitted
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
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

		countersDifference := domain.Counters{}.Substract(resource.Counters)

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

func (sess Session) checkParentAllowed(resource domain.Resource, parentID uuid.UUID) bool {
	var parentResource domain.Resource

	if err := sess.DB.First(&parentResource, "id = ?", parentID).Error; err != nil {
		return false
	}

	pt := parentResource.Type

	switch resource.Type {
	case domain.TypeArea:
		return pt == domain.TypeRoot || pt == domain.TypeArea
	case domain.TypeCrag:
		return pt == domain.TypeArea
	case domain.TypeSector:
		return pt == domain.TypeCrag
	case domain.TypeRoute:
		return pt == domain.TypeArea || pt == domain.TypeCrag || pt == domain.TypeSector
	case domain.TypePoint:
		return pt == domain.TypeRoute
	case domain.TypeBolt:
		return pt == domain.TypePoint
	case domain.TypeImage:
		return pt == domain.TypePoint
	case domain.TypeComment:
		return pt == domain.TypePoint
	case domain.TypeTask:
		return pt == domain.TypeRoute || pt == domain.TypePoint
	default:
		return false
	}
}
