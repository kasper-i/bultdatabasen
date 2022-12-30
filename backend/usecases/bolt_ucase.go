package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type boltUsecase struct {
	store domain.Datastore
}

func NewBoltUsecase(store domain.Datastore) domain.BoltUsecase {
	return &boltUsecase{
		store: store,
	}
}

func (uc *boltUsecase) GetBolts(ctx context.Context, resourceID uuid.UUID) ([]domain.Bolt, error) {
	return uc.store.GetBolts(ctx, resourceID)
}

func (uc *boltUsecase) GetBolt(ctx context.Context, resourceID uuid.UUID) (domain.Bolt, error) {
	return uc.store.GetBolt(ctx, resourceID)
}

func (uc *boltUsecase) CreateBolt(ctx context.Context, bolt domain.Bolt, parentResourceID uuid.UUID) (domain.Bolt, error) {
	bolt.UpdateCounters()

	resource := domain.Resource{
		ResourceBase: bolt.ResourceBase,
		Type:         domain.TypeBolt,
	}

	err := uc.store.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			bolt.ID = createdResource.ID
		}

		if err := store.InsertBolt(ctx, bolt); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, bolt.ID, bolt.Counters); err != nil {
			return err
		}

		if refreshedBolt, err := store.GetBolt(ctx, bolt.ID); err != nil {
			return err
		} else {
			bolt = refreshedBolt
		}

		if ancestors, err := store.GetAncestors(ctx, bolt.ID); err != nil {
			return nil
		} else {
			bolt.Ancestors = ancestors
		}

		return nil
	})

	if err != nil {
		return domain.Bolt{}, err
	}

	return bolt, err
}

func (uc *boltUsecase) DeleteBolt(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.store, resourceID)
}

func (uc *boltUsecase) UpdateBolt(ctx context.Context, boltID uuid.UUID, updatedBolt domain.Bolt) (domain.Bolt, error) {
	var refreshedBolt domain.Bolt

	err := uc.store.Transaction(func(store domain.Datastore) error {
		original, err := uc.store.GetBoltWithLock(ctx, boltID)
		if err != nil {
			return err
		}

		updatedBolt.ID = original.ID
		updatedBolt.Counters = original.Counters
		updatedBolt.UpdateCounters()

		countersDifference := updatedBolt.Counters.Substract(original.Counters)

		if err := store.TouchResource(ctx, boltID, ""); err != nil {
			return err
		}

		if err := store.SaveBolt(ctx, updatedBolt); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, boltID, countersDifference); err != nil {
			return err
		}

		refreshedBolt, err = store.GetBolt(ctx, boltID)
		if err != nil {
			return err
		}

		return nil
	})

	return refreshedBolt, err
}
