package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type resourceUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewResourceUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore, rm domain.ResourceManager) domain.ResourceUsecase {
	return &resourceUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

type ResourcePatch struct {
	ParentID uuid.UUID `json:"parentId"`
}

func (uc *resourceUsecase) GetResource(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, resourceID)
	if err != nil {
		return domain.Resource{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return domain.Resource{}, err
	}

	resource, err := uc.repo.GetResource(ctx, resourceID)
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

	if newParentID.String() != domain.RootID {
		if err := uc.authorizer.HasPermission(ctx, &user, newParentID, domain.WritePermission); err != nil {
			return err
		}
	}

	return uc.rm.MoveResource(ctx, resourceID, newParentID)
}

func (uc *resourceUsecase) GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.repo.GetAncestors(ctx, resourceID)
}

func (uc *resourceUsecase) GetChildren(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.repo.GetChildren(ctx, resourceID)
}

func (uc *resourceUsecase) Search(ctx context.Context, name string) ([]domain.ResourceWithParents, error) {
	return uc.repo.Search(ctx, name)
}
