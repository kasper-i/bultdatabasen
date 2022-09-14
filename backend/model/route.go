package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Route struct {
	ResourceBase
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

func (route *Route) UpdateCounters() {
	route.Counters.Routes = 1
}

func (sess Session) GetRoutes(resourceID string) ([]Route, error) {
	var routes []Route = make([]Route, 0)

	if err := sess.DB.Raw(buildDescendantsQuery("route"), resourceID).Scan(&routes).Error; err != nil {
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

func (sess Session) getRouteWithLock(resourceID string) (*Route, error) {
	var route Route

	if err := sess.DB.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ? FOR UPDATE`, resourceID).
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
	route.UpdateCounters()

	resource := Resource{
		ResourceBase: route.ResourceBase,
		Name:         &route.Name,
		Type:         "route",
		ParentID:     &parentResourceID,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&route).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(route.ID, route.Counters); err != nil {
			return err
		}

		return nil
	})

	return err
}

func (sess Session) DeleteRoute(resourceID string) error {
	return sess.deleteResource(resourceID)
}

func (sess Session) UpdateRoute(routeID string, updatedRoute Route) (*Route, error) {
	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getRouteWithLock(routeID)
		if err != nil {
			return err
		}

		updatedRoute.ID = original.ID
		updatedRoute.ParentID = original.ParentID
		updatedRoute.Counters = original.Counters
		updatedRoute.UpdateCounters()

		countersDifference := updatedRoute.Counters.Substract(original.Counters)

		if err := sess.touchResource(routeID); err != nil {
			return err
		}

		if err := sess.DB.Select(
			"Name").Updates(updatedRoute).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(routeID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &updatedRoute, nil
}
