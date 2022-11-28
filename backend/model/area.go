package model

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Area struct {
	ResourceBase
	Name     string `json:"name"`
	ParentID string `gorm:"->" json:"parentId"`
}

func (Area) TableName() string {
	return "area"
}

func (sess Session) GetAreas(resourceID string) ([]Area, error) {
	var areas []Area = make([]Area, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN area ON tree.resource_id = area.id`,
		withTreeQuery()), resourceID).Scan(&areas).Error; err != nil {
		return nil, err
	}

	return areas, nil
}

func (sess Session) GetArea(resourceID string) (*Area, error) {
	var area Area

	if err := sess.DB.Raw(`SELECT * FROM area INNER JOIN resource ON area.id = resource.id WHERE area.id = ?`, resourceID).
		Scan(&area).Error; err != nil {
		return nil, err
	}

	if area.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &area, nil
}

func (sess Session) CreateArea(area *Area, parentResourceID string, userID string) error {
	area.ID = uuid.Must(uuid.NewRandom()).String()

	resource := Resource{
		ResourceBase: area.ResourceBase,
		Name:         &area.Name,
		Type:         "area",
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&area).Error; err != nil {
			return err
		}

		if err := sess.DB.Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, area.ID, "owner").Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func (sess Session) DeleteArea(resourceID string) error {
	return sess.deleteResource(resourceID)
}
