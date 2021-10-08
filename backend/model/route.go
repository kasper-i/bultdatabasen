package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Route struct {
	ID           string  `gorm:"primaryKey" json:"id"`
	Name         string  `json:"name"`
	AltName      *string `json:"altName,omitempty"`
	Year         *int32  `json:"year,omitempty"`
	Length       *int32  `json:"length,omitempty"`
	ExternalLink *string `json:"externalLink,omitempty"`
	RouteType    *string `json:"routeType,omitempty"`
	ParentID     string  `gorm:"->" json:"parentId"`
}

func (Route) TableName() string {
	return "route"
}

func (sess Session) GetRoutes(resourceID string) ([]Route, error) {
	var routes []Route = make([]Route, 0)

	if err := sess.DB.Raw(getDescendantsQuery("route"), resourceID).Scan(&routes).Error; err != nil {
		return nil, err
	}

	return routes, nil
}

func (sess Session) GetRoute(resourceID string) (*Route, error) {
	var route Route

	if err := sess.DB.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ?`, resourceID).
		Scan(&route).Error; err != nil {
		return nil, err
	}

	if route.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &route, nil
}

func (sess Session) CreateRoute(route *Route, parentResourceID string) error {
	route.ID = uuid.Must(uuid.NewRandom()).String()
	route.ParentID = parentResourceID

	resource := Resource{
		ID:       route.ID,
		Name:     &route.Name,
		Type:     "route",
		ParentID: &parentResourceID,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&route).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func (sess Session) DeleteRoute(resourceID string) error {
	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Delete(&Route{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := sess.DB.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
