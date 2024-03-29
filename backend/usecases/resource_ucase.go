package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type resourceUsecase struct {
	resourceRepo  domain.ResourceRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rh            domain.ResourceHelper
}

func NewResourceUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, resourceRepo domain.ResourceRepository, rh domain.ResourceHelper) domain.ResourceUsecase {
	return &resourceUsecase{
		resourceRepo:  resourceRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rh:            rh,
	}
}

func (uc *resourceUsecase) GetResource(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	ancestors, err := uc.rh.GetAncestors(ctx, resourceID)
	if err != nil {
		return domain.Resource{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return domain.Resource{}, err
	}

	resource, err := uc.resourceRepo.GetResource(ctx, resourceID)
	if err != nil {
		return domain.Resource{}, err
	}

	resource.Ancestors = ancestors
	return resource, nil
}

func (uc *resourceUsecase) MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, resourceID, domain.WritePermission); err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, newParentID, domain.WritePermission); err != nil {
		return err
	}

	return uc.rh.MoveResource(ctx, resourceID, newParentID)
}

func (uc *resourceUsecase) GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.rh.GetAncestors(ctx, resourceID)
}

func (uc *resourceUsecase) GetChildren(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.resourceRepo.GetChildren(ctx, resourceID)
}

func (uc *resourceUsecase) Search(ctx context.Context, name string) ([]domain.ResourceWithParents, error) {
	return uc.resourceRepo.Search(ctx, name)
}
