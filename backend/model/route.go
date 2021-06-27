package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Route struct {
	ID           string  `gorm:"primaryKey" json:"id"`
	Name         string  `json:"name"`
	AltName      *string `json:"altName"`
	Year         *int32  `json:"year"`
	Length       *int32  `json:"length"`
	ExternalLink *string `json:"externalLink"`
	RouteType    *string `json:"routeType"`
	ParentID     string  `gorm:"->" json:"parentId"`
}

func (Route) TableName() string {
	return "route"
}

func GetRoutes(db *gorm.DB, resourceID string) ([]Route, error) {
	var routes []Route = make([]Route, 0)

	if err := db.Raw(getDescendantsQuery("route"), resourceID).Scan(&routes).Error; err != nil {
		return nil, err
	}

	return routes, nil
}

func GetRoute(db *gorm.DB, resourceID string) (*Route, error) {
	var route Route

	if err := db.Raw(`SELECT * FROM route LEFT JOIN resource ON route.id = resource.id WHERE route.id = ?`, resourceID).
		Scan(&route).Error; err != nil {
		return nil, err
	}

	if route.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &route, nil
}

func CreateRoute(db *gorm.DB, route *Route, parentResourceID string) error {
	route.ID = uuid.Must(uuid.NewRandom()).String()
	route.ParentID = parentResourceID

	resource := Resource{
		ID:       route.ID,
		Name:     &route.Name,
		Type:     "route",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&route).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func DeleteRoute(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Route{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
