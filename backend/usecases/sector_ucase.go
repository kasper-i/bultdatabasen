package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type sectorUsecase struct {
	sectorRepo    domain.SectorRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rh            domain.ResourceHelper
}

func NewSectorUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, sectorRepo domain.SectorRepository, rh domain.ResourceHelper) domain.SectorUsecase {
	return &sectorUsecase{
		sectorRepo:    sectorRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rh:            rh,
	}
}

func (uc *sectorUsecase) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.sectorRepo.GetSectors(ctx, resourceID)
}

func (uc *sectorUsecase) GetSector(ctx context.Context, sectorID uuid.UUID) (domain.Sector, error) {
	ancestors, err := uc.rh.GetAncestors(ctx, sectorID)
	if err != nil {
		return domain.Sector{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, sectorID, domain.ReadPermission); err != nil {
		return domain.Sector{}, err
	}

	sector, err := uc.sectorRepo.GetSector(ctx, sectorID)
	if err != nil {
		return domain.Sector{}, err
	}

	sector.Ancestors = ancestors
	return sector, nil
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

	err = uc.sectorRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rh.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			sector.ID = createdResource.ID
		}

		if err := uc.sectorRepo.InsertSector(txCtx, sector); err != nil {
			return err
		}

		if sector.Ancestors, err = uc.rh.GetAncestors(txCtx, sector.ID); err != nil {
			return nil
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

	_, err = uc.sectorRepo.GetSector(ctx, sectorID)
	if err != nil {
		return err
	}

	return uc.rh.DeleteResource(ctx, sectorID, user.ID)
}
