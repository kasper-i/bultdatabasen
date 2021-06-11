package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Crag struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
	ParentID string `gorm:"->" json:"parent_id"`
}

func (Crag) TableName() string {
	return "crag"
}

func GetCrags(db *gorm.DB, resourceID string) ([]Crag, error) {
	var crags []Crag = make([]Crag, 0)

	if err := db.Raw(getDescendantsQuery("crag"), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func GetCrag(db *gorm.DB, resourceID string) (*Crag, error) {
	var crag Crag

	if err := db.First(&crag, "id = ?", resourceID).Error; err != nil {
		return nil, err
	}

	return &crag, nil
}

func CreateCrag(db *gorm.DB, crag *Crag, parentResourceID string) error {
	crag.ID = uuid.Must(uuid.NewRandom()).String()

	resource := Resource{
		ID:       crag.ID,
		Name:     crag.Name,
		Type:     "crag",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&crag).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func DeleteCrag(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Crag{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
