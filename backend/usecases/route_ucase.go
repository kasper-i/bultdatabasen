package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type routeUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewRouteUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore) domain.RouteUsecase {
	return &routeUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
	}
}

func (uc *routeUsecase) GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]domain.Route, error) {
	return uc.repo.GetRoutes(ctx, resourceID)
}

func (uc *routeUsecase) GetRoute(ctx context.Context, routeID uuid.UUID) (domain.Route, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, routeID)
	if err != nil {
		return domain.Route{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, routeID, domain.ReadPermission); err != nil {
		return domain.Route{}, err
	}

	route, err := uc.repo.GetRoute(ctx, routeID)
	if err != nil {
		return domain.Route{}, err
	}

	route.Ancestors = ancestors
	return route, nil
}

func (uc *routeUsecase) CreateRoute(ctx context.Context, route domain.Route, parentResourceID uuid.UUID) (domain.Route, error) {
	route.UpdateCounters()

	resource := domain.Resource{
		Name: &route.Name,
		Type: domain.TypeRoute,
	}

	err := uc.repo.Transaction(func(store domain.Datastore) error {
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
	return deleteResource(ctx, uc.repo, resourceID)
}

func (uc *routeUsecase) UpdateRoute(ctx context.Context, routeID uuid.UUID, updatedRoute domain.Route) (domain.Route, error) {
	err := uc.repo.Transaction(func(store domain.Datastore) error {
		original, err := uc.repo.GetRouteWithLock(routeID)
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

		if err := uc.repo.SaveRoute(ctx, updatedRoute); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, routeID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	return updatedRoute, err
}
