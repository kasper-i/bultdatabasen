package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type routeUsecase struct {
	routeRepo     domain.RouteRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewRouteUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, routeRepo domain.RouteRepository, rm domain.ResourceManager) domain.RouteUsecase {
	return &routeUsecase{
		routeRepo:     routeRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

func (uc *routeUsecase) GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]domain.Route, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.routeRepo.GetRoutes(ctx, resourceID)
}

func (uc *routeUsecase) GetRoute(ctx context.Context, routeID uuid.UUID) (domain.Route, error) {
	ancestors, err := uc.rm.GetAncestors(ctx, routeID)
	if err != nil {
		return domain.Route{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, routeID, domain.ReadPermission); err != nil {
		return domain.Route{}, err
	}

	route, err := uc.routeRepo.GetRoute(ctx, routeID)
	if err != nil {
		return domain.Route{}, err
	}

	route.Ancestors = ancestors
	return route, nil
}

func (uc *routeUsecase) CreateRoute(ctx context.Context, route domain.Route, parentResourceID uuid.UUID) (domain.Route, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Route{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Route{}, err
	}

	route.UpdateCounters()

	resource := domain.Resource{
		Name: &route.Name,
		Type: domain.TypeRoute,
	}

	err = uc.routeRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			route.ID = createdResource.ID
		}

		if err := uc.routeRepo.InsertRoute(txCtx, route); err != nil {
			return err
		}

		if route.Ancestors, err = uc.rm.GetAncestors(txCtx, route.ID); err != nil {
			return nil
		}

		if err := uc.rm.UpdateCounters(txCtx, route.Counters, append(route.Ancestors.IDs(), route.ID)...); err != nil {
			return err
		}

		return nil
	})

	return route, err
}

func (uc *routeUsecase) DeleteRoute(ctx context.Context, routeID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, routeID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.routeRepo.GetRoute(ctx, routeID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, routeID, user.ID)
}

func (uc *routeUsecase) UpdateRoute(ctx context.Context, routeID uuid.UUID, updatedRoute domain.Route) (domain.Route, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Route{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, routeID, domain.WritePermission); err != nil {
		return domain.Route{}, err
	}

	err = uc.routeRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		original, err := uc.routeRepo.GetRouteWithLock(ctx, routeID)
		if err != nil {
			return err
		}

		updatedRoute.ID = original.ID
		updatedRoute.Counters = original.Counters
		updatedRoute.UpdateCounters()

		countersDifference := updatedRoute.Counters.Substract(original.Counters)

		if updatedRoute.Name != original.Name {
			if err := uc.rm.RenameResource(txCtx, routeID, updatedRoute.Name, user.ID); err != nil {
				return err
			}
		}

		if err := uc.rm.TouchResource(txCtx, routeID, user.ID); err != nil {
			return err
		}

		if err := uc.routeRepo.SaveRoute(txCtx, updatedRoute); err != nil {
			return err
		}

		if updatedRoute.Ancestors, err = uc.rm.GetAncestors(txCtx, routeID); err != nil {
			return nil
		}

		if err := uc.rm.UpdateCounters(txCtx, countersDifference, append(updatedRoute.Ancestors.IDs(), routeID)...); err != nil {
			return err
		}

		return nil
	})

	return updatedRoute, err
}
