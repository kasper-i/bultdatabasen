package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Sector struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
	ParentID string `gorm:"->" json:"parentId"`
}

func (Sector) TableName() string {
	return "sector"
}

func GetSectors(db *gorm.DB, resourceID string) ([]Sector, error) {
	var sectors []Sector = make([]Sector, 0)

	if err := db.Raw(getDescendantsQuery("sector"), resourceID).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func GetSector(db *gorm.DB, resourceID string) (*Sector, error) {
	var sector Sector

	if err := db.First(&sector, "id = ?", resourceID).Error; err != nil {
		return nil, err
	}

	return &sector, nil
}

func CreateSector(db *gorm.DB, sector *Sector, parentResourceID string) error {
	sector.ID = uuid.Must(uuid.NewRandom()).String()

	resource := Resource{
		ID:       sector.ID,
		Name:     sector.Name,
		Type:     "sector",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&sector).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func DeleteSector(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Sector{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
