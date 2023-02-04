package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type cragUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewCragUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore) domain.CragUsecase {
	return &cragUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
	}
}

func (uc *cragUsecase) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	return uc.repo.GetCrags(ctx, resourceID)
}

func (uc *cragUsecase) GetCrag(ctx context.Context, cragID uuid.UUID) (domain.Crag, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, cragID)
	if err != nil {
		return domain.Crag{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, cragID, domain.ReadPermission); err != nil {
		return domain.Crag{}, err
	}

	crag, err := uc.repo.GetCrag(ctx, cragID)
	if err != nil {
		return domain.Crag{}, err
	}

	crag.Ancestors = ancestors
	return crag, nil
}

func (uc *cragUsecase) CreateCrag(ctx context.Context, crag domain.Crag, parentResourceID uuid.UUID) (domain.Crag, error) {
	resource := domain.Resource{
		Name: &crag.Name,
		Type: domain.TypeCrag,
	}

	err := uc.repo.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			crag.ID = createdResource.ID
		}

		if err := uc.repo.InsertCrag(ctx, crag); err != nil {
			return err
		}

		if ancestors, err := store.GetAncestors(ctx, crag.ID); err != nil {
			return nil
		} else {
			crag.Ancestors = ancestors
		}

		return nil
	})

	return crag, err
}

func (uc *cragUsecase) DeleteCrag(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.repo, resourceID)
}
