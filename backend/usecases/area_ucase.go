package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type areaUsecase struct {
	store domain.Datastore
}

func NewAreaUsecase(store domain.Datastore) domain.AreaUsecase {
	return &areaUsecase{
		store: store,
	}
}

func (uc *areaUsecase) GetAreas(ctx context.Context, resourceID uuid.UUID) ([]domain.Area, error) {
	return uc.store.GetAreas(ctx, resourceID)
}

func (uc *areaUsecase) GetArea(ctx context.Context, resourceID uuid.UUID) (domain.Area, error) {
	return uc.store.GetArea(ctx, resourceID)
}

func (uc *areaUsecase) CreateArea(ctx context.Context, area domain.Area, parentResourceID uuid.UUID, userID string) (domain.Area, error) {
	resource := domain.Resource{
		Name: &area.Name,
		Type: domain.TypeArea,
	}

	err := uc.store.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			area.ID = createdResource.ID
		}

		if err := store.InsertArea(ctx, area); err != nil {
			return err
		}

		if err := store.InsertResourceAccess(ctx, area.ID, userID, "owner"); err != nil {
			return err
		}

		if ancestors, err := store.GetAncestors(ctx, area.ID); err != nil {
			return nil
		} else {
			area.Ancestors = ancestors
		}

		return nil
	})

	return area, err
}

func (uc *areaUsecase) DeleteArea(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.store, resourceID)
}
