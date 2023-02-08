package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]domain.Route, error) {
	var routes []domain.Route = make([]domain.Route, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN route ON tree.resource_id = route.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&routes).Error; err != nil {
		return nil, err
	}

	return routes, nil
}

func (store *psqlDatastore) GetRoute(ctx context.Context, resourceID uuid.UUID) (domain.Route, error) {
	var route domain.Route

	if err := store.tx.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ?`, resourceID).
		Scan(&route).Error; err != nil {
		return domain.Route{}, err
	}

	if route.ID == uuid.Nil {
		return domain.Route{}, gorm.ErrRecordNotFound
	}

	return route, nil
}

func (store *psqlDatastore) GetRouteWithLock(resourceID uuid.UUID) (domain.Route, error) {
	var route domain.Route

	if err := store.tx.Raw(`SELECT * FROM route INNER JOIN resource ON route.id = resource.id WHERE route.id = ? FOR UPDATE`, resourceID).
		Scan(&route).Error; err != nil {
		return domain.Route{}, err
	}

	if route.ID == uuid.Nil {
		return domain.Route{}, gorm.ErrRecordNotFound
	}

	return route, nil
}

func (store *psqlDatastore) InsertRoute(ctx context.Context, route domain.Route) error {
	return store.tx.Create(route).Error
}

func (store *psqlDatastore) SaveRoute(ctx context.Context, route domain.Route) error {
	return store.tx.Select(
		"Name", "AltName", "Year", "Length", "RouteType").Updates(route).Error
}
