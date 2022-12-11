package model

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Crag struct {
	ResourceBase
	Name string `json:"name"`
}

func (Crag) TableName() string {
	return "crag"
}

func (sess Session) GetCrags(resourceID uuid.UUID) ([]Crag, error) {
	var crags []Crag = make([]Crag, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN crag ON tree.resource_id = crag.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
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
	resource := Resource{
		Name: &crag.Name,
		Type: TypeCrag,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}

		crag.ID = resource.ID

		if err := sess.DB.Create(&crag).Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(crag.ID); err != nil {
			return nil
		} else {
			crag.Ancestors = &ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteCrag(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}
