package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type cragUsecase struct {
	store domain.Datastore
}

func NewCragUsecase(store domain.Datastore) domain.CragUsecase {
	return &cragUsecase{
		store: store,
	}
}

func (uc *cragUsecase) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	return uc.store.GetCrags(ctx, resourceID)
}

func (uc *cragUsecase) GetCrag(ctx context.Context, resourceID uuid.UUID) (domain.Crag, error) {
	return uc.store.GetCrag(ctx, resourceID)
}

func (uc *cragUsecase) CreateCrag(ctx context.Context, crag domain.Crag, parentResourceID uuid.UUID) (domain.Crag, error) {
	resource := domain.Resource{
		Name: &crag.Name,
		Type: domain.TypeCrag,
	}

	err := uc.store.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			crag.ID = createdResource.ID
		}

		if err := uc.store.InsertCrag(ctx, crag); err != nil {
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
	return deleteResource(ctx, uc.store, resourceID)
}
