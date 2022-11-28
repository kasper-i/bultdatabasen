package model

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Crag struct {
	ResourceBase
	Name     string `json:"name"`
	ParentID uuid.UUID `gorm:"->" json:"parentId"`
}

func (Crag) TableName() string {
	return "crag"
}

func (sess Session) GetCrags(resourceID uuid.UUID) ([]Crag, error) {
	var crags []Crag = make([]Crag, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN crag ON tree.resource_id = crag.id`,
		withTreeQuery()), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func (sess Session) GetCrag(resourceID uuid.UUID) (*Crag, error) {
	var crag Crag

	if err := sess.DB.Raw(`SELECT * FROM crag INNER JOIN resource ON crag.id = resource.id WHERE crag.id = ?`, resourceID).
		Scan(&crag).Error; err != nil {
		return nil, err
	}

	if crag.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &crag, nil
}

func (sess Session) CreateCrag(crag *Crag, parentResourceID uuid.UUID) error {
	crag.ID = uuid.New()
	crag.ParentID = parentResourceID

	resource := Resource{
		ResourceBase: crag.ResourceBase,
		Name:         &crag.Name,
		Type:         "crag",
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&crag).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func (sess Session) DeleteCrag(resourceID uuid.UUID) error {
	return sess.deleteResource(resourceID)
}
