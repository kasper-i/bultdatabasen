package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Bolt struct {
	ID           string  `gorm:"primaryKey" json:"id"`
	Type         string  `json:"type"`
	ParentID     string  `gorm:"->" json:"parentId"`
}

func (Bolt) TableName() string {
	return "bolt"
}

func GetBolts(db *gorm.DB, resourceID string) ([]Bolt, error) {
	var bolts []Bolt = make([]Bolt, 0)

	if err := db.Raw(getDescendantsQuery("bolt"), resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}

func GetBolt(db *gorm.DB, resourceID string) (*Bolt, error) {
	var bolt Bolt

	if err := db.Raw(`SELECT * FROM bolt LEFT JOIN resource ON bolt.id = resource.id WHERE bolt.id = ?`, resourceID).
		Scan(&bolt).Error; err != nil {
		return nil, err
	}

	return &bolt, nil
}

func CreateBolt(db *gorm.DB, bolt *Bolt, parentResourceID string) error {
	bolt.ID = uuid.Must(uuid.NewRandom()).String()
	bolt.ParentID = parentResourceID

	resource := Resource{
		ID:       bolt.ID,
		Name:     nil,
		Type:     "bolt",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&bolt).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func DeleteBolt(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Bolt{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
