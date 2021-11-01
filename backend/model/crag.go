package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Crag struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	ParentID string `gorm:"->" json:"parentId"`
}

func (Crag) TableName() string {
	return "crag"
}

func (sess Session) GetCrags(resourceID string) ([]Crag, error) {
	var crags []Crag = make([]Crag, 0)

	if err := sess.DB.Raw(getDescendantsQuery("crag"), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func (sess Session) GetCrag(resourceID string) (*Crag, error) {
	var crag Crag

	if err := sess.DB.Raw(`SELECT * FROM crag INNER JOIN resource ON crag.id = resource.id WHERE crag.id = ?`, resourceID).
		Scan(&crag).Error; err != nil {
		return nil, err
	}

	if crag.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &crag, nil
}

func (sess Session) CreateCrag(crag *Crag, parentResourceID string) error {
	crag.ID = uuid.Must(uuid.NewRandom()).String()
	crag.ParentID = parentResourceID

	resource := Resource{
		ID:       crag.ID,
		Name:     &crag.Name,
		Type:     "crag",
		ParentID: &parentResourceID,
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

func (sess Session) DeleteCrag(resourceID string) error {
	return sess.deleteResource(resourceID)
}
