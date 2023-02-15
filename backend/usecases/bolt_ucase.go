package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type boltUsecase struct {
	boltRepo      domain.BoltRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewBoltUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, boltRepo domain.BoltRepository, rm domain.ResourceManager) domain.BoltUsecase {
	return &boltUsecase{
		boltRepo:      boltRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
	}
}

func (uc *boltUsecase) GetBolts(ctx context.Context, resourceID uuid.UUID) ([]domain.Bolt, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.boltRepo.GetBolts(ctx, resourceID)
}

func (uc *boltUsecase) GetBolt(ctx context.Context, boltID uuid.UUID) (domain.Bolt, error) {
	ancestors, err := uc.boltRepo.GetAncestors(ctx, boltID)
	if err != nil {
		return domain.Bolt{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, boltID, domain.ReadPermission); err != nil {
		return domain.Bolt{}, err
	}

	bolt, err := uc.boltRepo.GetBolt(ctx, boltID)
	if err != nil {
		return domain.Bolt{}, err
	}

	bolt.Ancestors = ancestors
	return bolt, nil
}

func (uc *boltUsecase) CreateBolt(ctx context.Context, bolt domain.Bolt, parentResourceID uuid.UUID) (domain.Bolt, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Bolt{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Bolt{}, err
	}

	bolt.UpdateCounters()

	resource := domain.Resource{
		ResourceBase: bolt.ResourceBase,
		Type:         domain.TypeBolt,
	}

	err = uc.boltRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(ctx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			bolt.ID = createdResource.ID
		}

		if err := uc.boltRepo.InsertBolt(txCtx, bolt); err != nil {
			return err
		}

		if refreshedBolt, err := uc.boltRepo.GetBolt(txCtx, bolt.ID); err != nil {
			return err
		} else {
			bolt = refreshedBolt
		}

		if ancestors, err := uc.boltRepo.GetAncestors(txCtx, bolt.ID); err != nil {
			return nil
		} else {
			bolt.Ancestors = ancestors
		}

		if err := uc.rm.UpdateCounters(txCtx, bolt.Counters, append(bolt.Ancestors.IDs(), bolt.ID)...); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return domain.Bolt{}, err
	}

	return bolt, err
}

func (uc *boltUsecase) DeleteBolt(ctx context.Context, boltID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, boltID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.boltRepo.GetBolt(ctx, boltID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, boltID, user.ID)
}

func (uc *boltUsecase) UpdateBolt(ctx context.Context, boltID uuid.UUID, updatedBolt domain.Bolt) (domain.Bolt, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Bolt{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, boltID, domain.WritePermission); err != nil {
		return domain.Bolt{}, err
	}

	var refreshedBolt domain.Bolt

	err = uc.boltRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		original, err := uc.boltRepo.GetBoltWithLock(txCtx, boltID)
		if err != nil {
			return err
		}

		updatedBolt.ID = original.ID
		updatedBolt.Counters = original.Counters
		updatedBolt.UpdateCounters()

		countersDifference := updatedBolt.Counters.Substract(original.Counters)

		if err := uc.boltRepo.TouchResource(txCtx, boltID, user.ID); err != nil {
			return err
		}

		if err := uc.boltRepo.SaveBolt(txCtx, updatedBolt); err != nil {
			return err
		}

		refreshedBolt, err = uc.boltRepo.GetBolt(txCtx, boltID)
		if err != nil {
			return err
		}

		if ancestors, err := uc.boltRepo.GetAncestors(txCtx, boltID); err != nil {
			return nil
		} else {
			refreshedBolt.Ancestors = ancestors
		}

		if err := uc.rm.UpdateCounters(txCtx, countersDifference, append(refreshedBolt.Ancestors.IDs(), boltID)...); err != nil {
			return err
		}

		return nil
	})

	return refreshedBolt, err
}
