package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type areaUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewAreaUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore, rm domain.ResourceManager) domain.AreaUsecase {
	return &areaUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

func (uc *areaUsecase) GetAreas(ctx context.Context, resourceID uuid.UUID) ([]domain.Area, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.repo.GetAreas(ctx, resourceID)
}

func (uc *areaUsecase) GetArea(ctx context.Context, areaID uuid.UUID) (domain.Area, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, areaID)
	if err != nil {
		return domain.Area{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, areaID, domain.ReadPermission); err != nil {
		return domain.Area{}, err
	}

	area, err := uc.repo.GetArea(ctx, areaID)
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

	err = uc.repo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			area.ID = createdResource.ID
		}

		if err := uc.repo.InsertArea(txCtx, area); err != nil {
			return err
		}

		if err := uc.repo.InsertResourceAccess(txCtx, area.ID, user.ID, domain.RoleOwner); err != nil {
			return err
		}

		if ancestors, err := uc.repo.GetAncestors(txCtx, area.ID); err != nil {
			return nil
		} else {
			area.Ancestors = ancestors
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

	_, err = uc.repo.GetArea(ctx, areaID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, areaID, user.ID)
}
