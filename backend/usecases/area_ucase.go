package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type areaUsecase struct {
	areaRepo      domain.AreaRepository
	authRepo      domain.AuthRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rh            domain.ResourceHelper
}

func NewAreaUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, areaRepo domain.AreaRepository, authRepo domain.AuthRepository, rh domain.ResourceHelper) domain.AreaUsecase {
	return &areaUsecase{
		areaRepo:      areaRepo,
		authRepo:      authRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rh:            rh,
	}
}

func (uc *areaUsecase) GetAreas(ctx context.Context, resourceID uuid.UUID) ([]domain.Area, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.areaRepo.GetAreas(ctx, resourceID)
}

func (uc *areaUsecase) GetArea(ctx context.Context, areaID uuid.UUID) (domain.Area, error) {
	ancestors, err := uc.rh.GetAncestors(ctx, areaID)
	if err != nil {
		return domain.Area{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, areaID, domain.ReadPermission); err != nil {
		return domain.Area{}, err
	}

	area, err := uc.areaRepo.GetArea(ctx, areaID)
	if err != nil {
		return domain.Area{}, err
	}

	area.Ancestors = ancestors
	return area, nil
}

func (uc *areaUsecase) CreateArea(ctx context.Context, area domain.Area, parentResourceID uuid.UUID) (domain.Area, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Area{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Area{}, err
	}

	resource := domain.Resource{
		Name: &area.Name,
		Type: domain.TypeArea,
	}

	err = uc.areaRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rh.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			area.ID = createdResource.ID
		}

		if err := uc.areaRepo.InsertArea(txCtx, area); err != nil {
			return err
		}

		role := domain.ResourceRole{
			ResourceID: area.ID,
			Role:       domain.RoleOwner,
		}
		if err := uc.authRepo.InsertUserRole(txCtx, user.ID, role); err != nil {
			return err
		}

		if area.Ancestors, err = uc.rh.GetAncestors(txCtx, area.ID); err != nil {
			return nil
		}

		return nil
	})

	return area, err
}

func (uc *areaUsecase) DeleteArea(ctx context.Context, areaID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, areaID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.areaRepo.GetArea(ctx, areaID)
	if err != nil {
		return err
	}

	return uc.rh.DeleteResource(ctx, areaID, user.ID)
}
