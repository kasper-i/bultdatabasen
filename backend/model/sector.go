package model

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Sector struct {
	ResourceBase
	Name     string `json:"name"`
	ParentID string `gorm:"->" json:"parentId"`
}

func (Sector) TableName() string {
	return "sector"
}

func (sess Session) GetSectors(resourceID string) ([]Sector, error) {
	var sectors []Sector = make([]Sector, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN sector ON tree.resource_id = sector.id`,
		withTreeQuery(resourceID))).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func (sess Session) GetSector(resourceID string) (*Sector, error) {
	var sector Sector

	if err := sess.DB.Raw(`SELECT * FROM sector INNER JOIN resource ON sector.id = resource.id WHERE sector.id = ?`, resourceID).
		Scan(&sector).Error; err != nil {
		return nil, err
	}

	if sector.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &sector, nil
}

func (sess Session) CreateSector(sector *Sector, parentResourceID string) error {
	sector.ID = uuid.Must(uuid.NewRandom()).String()
	sector.ParentID = parentResourceID

	resource := Resource{
		ResourceBase: sector.ResourceBase,
		Name:         &sector.Name,
		Type:         "sector"
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&sector).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func (sess Session) DeleteSector(resourceID string) error {
	return sess.deleteResource(resourceID)
}
