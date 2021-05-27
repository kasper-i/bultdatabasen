package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Area struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}

func (Area) TableName() string {
	return "area"
}

func GetAreas(db *gorm.DB) ([]Area, error) {
	var areas []Area = make([]Area, 0)

	if err := db.Raw(getDescendantsQuery("area"), RootID).Scan(&areas).Error; err != nil {
		return nil, err
	}

	return areas, nil
}

func GetArea(db *gorm.DB, resourceID string) (*Area, error) {
	var area Area

	if err := db.First(&area, "id = ?", resourceID).Error; err != nil {
		return nil, err
	}

	return &area, nil
}

func CreateArea(db *gorm.DB, area *Area) error {
	area.ID = uuid.Must(uuid.NewRandom()).String()
	parentResourceID := RootID

	resource := Resource{
		ID:       area.ID,
		Name:     area.Name,
		Type:     "area",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&area).Error; err != nil {
			return err
		}

		if err := tx.Exec("INSERT INTO user_role VALUES (?, ?, ?)", "be44169f-6e27-11eb-8c37-7085c2c40195", area.ID, "owner").Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func DeleteArea(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Area{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
