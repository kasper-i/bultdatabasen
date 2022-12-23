package model

import (
	"bultdatabasen/domain"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetAreas(resourceID uuid.UUID) ([]domain.Area, error) {
	var areas []domain.Area = make([]domain.Area, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN area ON tree.resource_id = area.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&areas).Error; err != nil {
		return nil, err
	}

	return areas, nil
}

func (sess Session) GetArea(resourceID uuid.UUID) (*domain.Area, error) {
	var area domain.Area

	if err := sess.DB.Raw(`SELECT * FROM area INNER JOIN resource ON area.id = resource.id WHERE area.id = ?`, resourceID).
		Scan(&area).Error; err != nil {
		return nil, err
	}

	if area.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &area, nil
}

func (sess Session) CreateArea(area *domain.Area, parentResourceID uuid.UUID, userID string) error {
	resource := domain.Resource{
		Name: &area.Name,
		Type: domain.TypeArea,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}

		area.ID = resource.ID

		if err := sess.DB.Create(&area).Error; err != nil {
			return err
		}

		if err := sess.DB.Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, area.ID, "owner").Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(area.ID); err != nil {
			return nil
		} else {
			area.Ancestors = ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteArea(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}
