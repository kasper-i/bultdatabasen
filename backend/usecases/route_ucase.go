package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type routeUsecase struct {
	store domain.Datastore
}

func NewRouteUsecase(store domain.Datastore) domain.RouteUsecase {
	return &routeUsecase{
		store: store,
	}
}

func (uc *routeUsecase) GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]domain.Route, error) {
	return uc.store.GetRoutes(ctx, resourceID)
}

func (uc *routeUsecase) GetRoute(ctx context.Context, resourceID uuid.UUID) (domain.Route, error) {
	return uc.store.GetRoute(ctx, resourceID)
}

func (uc *routeUsecase) CreateRoute(ctx context.Context, route domain.Route, parentResourceID uuid.UUID) (domain.Route, error) {
	route.UpdateCounters()

	resource := domain.Resource{
		Name: &route.Name,
		Type: domain.TypeRoute,
	}

	err := uc.store.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			route.ID = createdResource.ID
		}

		if err := store.InsertRoute(ctx, route); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, route.ID, route.Counters); err != nil {
			return err
		}

		if ancestors, err := store.GetAncestors(ctx, route.ID); err != nil {
			return nil
		} else {
			route.Ancestors = ancestors
		}

		return nil
	})

	return route, err
}

func (uc *routeUsecase) DeleteRoute(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.store, resourceID)
}

func (uc *routeUsecase) UpdateRoute(ctx context.Context, routeID uuid.UUID, updatedRoute domain.Route) (domain.Route, error) {
	err := uc.store.Transaction(func(store domain.Datastore) error {
		original, err := uc.store.GetRouteWithLock(routeID)
		if err != nil {
			return err
		}

		updatedRoute.ID = original.ID
		updatedRoute.Counters = original.Counters
		updatedRoute.UpdateCounters()

		countersDifference := updatedRoute.Counters.Substract(original.Counters)

		if updatedRoute.Name != original.Name {
			if err := store.RenameResource(ctx, routeID, updatedRoute.Name, ""); err != nil {
				return err
			}
		}

		if err := store.TouchResource(ctx, routeID, ""); err != nil {
			return err
		}

		if err := uc.store.SaveRoute(ctx, updatedRoute); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, routeID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	return updatedRoute, err
}
