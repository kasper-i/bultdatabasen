package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type sectorUsecase struct {
	store domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
}

func NewSectorUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore) domain.SectorUsecase {
	return &sectorUsecase{
		store: store,
		authenticator: authenticator,
		authorizer:    authorizer,
	}
}

func (uc *sectorUsecase) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	return uc.store.GetSectors(ctx, resourceID)
}

func (uc *sectorUsecase) GetSector(ctx context.Context, resourceID uuid.UUID) (domain.Sector, error) {
	return uc.store.GetSector(ctx, resourceID)
}

func (uc *sectorUsecase) CreateSector(ctx context.Context, sector domain.Sector, parentResourceID uuid.UUID) (domain.Sector, error) {
	resource := domain.Resource{
		Name: &sector.Name,
		Type: domain.TypeSector,
	}

	err := uc.store.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			sector.ID = createdResource.ID
		}

		if err := uc.store.InsertSector(ctx, sector); err != nil {
			return err
		}

		if ancestors, err := store.GetAncestors(ctx, sector.ID); err != nil {
			return nil
		} else {
			sector.Ancestors = ancestors
		}

		return nil
	})

	return sector, err
}

func (uc *sectorUsecase) DeleteSector(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.store, resourceID)
}
