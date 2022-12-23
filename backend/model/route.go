package model

import (
	"bultdatabasen/domain"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetRoutes(resourceID uuid.UUID) ([]domain.Route, error) {
	var routes []domain.Route = make([]domain.Route, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN route ON tree.resource_id = route.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&routes).Error; err != nil {
		return nil, err
	}

	return routes, nil
}

func (sess Session) GetRoute(resourceID uuid.UUID) (*domain.Route, error) {
	var route domain.Route

	if err := sess.DB.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ?`, resourceID).
		Scan(&route).Error; err != nil {
		return nil, err
	}

	if route.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &route, nil
}

func (sess Session) getRouteWithLock(resourceID uuid.UUID) (*domain.Route, error) {
	var route domain.Route

	if err := sess.DB.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ? FOR UPDATE`, resourceID).
		Scan(&route).Error; err != nil {
		return nil, err
	}

	if route.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &route, nil
}

func (sess Session) CreateRoute(route *domain.Route, parentResourceID uuid.UUID) error {
	route.UpdateCounters()

	resource := domain.Resource{
		Name: &route.Name,
		Type: domain.TypeRoute,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}

		route.ID = resource.ID

		if err := sess.DB.Create(&route).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(route.ID, route.Counters); err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(route.ID); err != nil {
			return nil
		} else {
			route.Ancestors = ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteRoute(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}

func (sess Session) UpdateRoute(routeID uuid.UUID, updatedRoute domain.Route) (*domain.Route, error) {
	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getRouteWithLock(routeID)
		if err != nil {
			return err
		}

		updatedRoute.ID = original.ID
		updatedRoute.Counters = original.Counters
		updatedRoute.UpdateCounters()

		countersDifference := updatedRoute.Counters.Substract(original.Counters)

		if updatedRoute.Name != original.Name {
			if err := sess.RenameResource(routeID, updatedRoute.Name); err != nil {
				return err
			}
		}

		if err := sess.TouchResource(routeID); err != nil {
			return err
		}

		if err := sess.DB.Select(
			"Name", "AltName", "Year", "Length", "RouteType").Updates(updatedRoute).Error; err != nil {
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
