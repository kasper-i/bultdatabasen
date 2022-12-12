package model

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Sector struct {
	ResourceBase
	Name string `json:"name"`
}

func (Sector) TableName() string {
	return "sector"
}

func (sess Session) GetSectors(resourceID uuid.UUID) ([]Sector, error) {
	var sectors []Sector = make([]Sector, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN sector ON tree.resource_id = sector.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func (sess Session) GetSector(resourceID uuid.UUID) (*Sector, error) {
	var sector Sector

	if err := sess.DB.Raw(`SELECT * FROM sector INNER JOIN resource ON sector.id = resource.id WHERE sector.id = ?`, resourceID).
		Scan(&sector).Error; err != nil {
		return nil, err
	}

	if sector.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &sector, nil
}

func (sess Session) CreateSector(sector *Sector, parentResourceID uuid.UUID) error {
	resource := Resource{
		Name: &sector.Name,
		Type: TypeSector,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}

		sector.ID = resource.ID

		if err := sess.DB.Create(&sector).Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(sector.ID); err != nil {
			return nil
		} else {
			sector.Ancestors = &ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteSector(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}
