package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type cragUsecase struct {
	cragRepo      domain.CragRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewCragUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, cragRepo domain.CragRepository, rm domain.ResourceManager) domain.CragUsecase {
	return &cragUsecase{
		cragRepo:      cragRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

func (uc *cragUsecase) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.cragRepo.GetCrags(ctx, resourceID)
}

func (uc *cragUsecase) GetCrag(ctx context.Context, cragID uuid.UUID) (domain.Crag, error) {
	ancestors, err := uc.rm.GetAncestors(ctx, cragID)
	if err != nil {
		return domain.Crag{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, cragID, domain.ReadPermission); err != nil {
		return domain.Crag{}, err
	}

	crag, err := uc.cragRepo.GetCrag(ctx, cragID)
	if err != nil {
		return domain.Crag{}, err
	}

	crag.Ancestors = ancestors
	return crag, nil
}

func (uc *cragUsecase) CreateCrag(ctx context.Context, crag domain.Crag, parentResourceID uuid.UUID) (domain.Crag, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Crag{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Crag{}, err
	}

	resource := domain.Resource{
		Name: &crag.Name,
		Type: domain.TypeCrag,
	}

	err = uc.cragRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			crag.ID = createdResource.ID
		}

		if err := uc.cragRepo.InsertCrag(txCtx, crag); err != nil {
			return err
		}

		if crag.Ancestors, err = uc.rm.GetAncestors(txCtx, crag.ID); err != nil {
			return nil
		}

		return nil
	})

	return crag, err
}

func (uc *cragUsecase) DeleteCrag(ctx context.Context, cragID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, cragID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.cragRepo.GetCrag(ctx, cragID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, cragID, user.ID)
}
