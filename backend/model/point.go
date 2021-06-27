package model

import (
	"bultdatabasen/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Point struct {
	ID           string  `gorm:"primaryKey" json:"id"`
	ParentID     string  `gorm:"->" json:"parentId"`
}

func (Point) TableName() string {
	return "point"
}

func GetPoints(db *gorm.DB, resourceID string) ([]Point, error) {
	var points []Point = make([]Point, 0)

	if err := db.Raw(getDescendantsQuery("point"), resourceID).Scan(&points).Error; err != nil {
		return nil, err
	}

	return points, nil
}

func CreatePoint(db *gorm.DB, point *Point, parentResourceID string) error {
	point.ParentID = parentResourceID

	if point.ID != "" {
		var childResource *Resource
		var err error

		if childResource, err = GetResource(db, point.ID); err != nil || childResource.Type != "point" {
			return utils.ErrIllegalChildResource
		}

		if _, err = GetRoute(db, parentResourceID); err != nil {
			return utils.ErrIllegalParentResource
		}

		if err = addFosterParent(db, *childResource, parentResourceID); err != nil {
			return err
		}

		return nil
	}

	point.ID = uuid.Must(uuid.NewRandom()).String()

	resource := Resource{
		ID:       point.ID,
		Name:     nil,
		Type:     "point",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&point).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

