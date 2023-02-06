package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type sectorUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewSectorUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore, rm domain.ResourceManager) domain.SectorUsecase {
	return &sectorUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

func (uc *sectorUsecase) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.repo.GetSectors(ctx, resourceID)
}

func (uc *sectorUsecase) GetSector(ctx context.Context, cragID uuid.UUID) (domain.Sector, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, cragID)
	if err != nil {
		return domain.Sector{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, cragID, domain.ReadPermission); err != nil {
		return domain.Sector{}, err
	}

	crag, err := uc.repo.GetSector(ctx, cragID)
	if err != nil {
		return domain.Sector{}, err
	}

	crag.Ancestors = ancestors
	return crag, nil
}

func (uc *sectorUsecase) CreateSector(ctx context.Context, sector domain.Sector, parentResourceID uuid.UUID) (domain.Sector, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Sector{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Sector{}, err
	}

	resource := domain.Resource{
		Name: &sector.Name,
		Type: domain.TypeSector,
	}

	err = uc.repo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(txCtx, resource, parentResourceID, ""); err != nil {
			return err
		} else {
			sector.ID = createdResource.ID
		}

		if err := uc.repo.InsertSector(txCtx, sector); err != nil {
			return err
		}

		if ancestors, err := uc.repo.GetAncestors(txCtx, sector.ID); err != nil {
			return nil
		} else {
			sector.Ancestors = ancestors
		}

		return nil
	})

	return sector, err
}

func (uc *sectorUsecase) DeleteSector(ctx context.Context, sectorID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, sectorID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.repo.GetSector(ctx, sectorID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, sectorID, user.ID)
}
