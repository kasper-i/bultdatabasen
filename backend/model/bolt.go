package model

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetBolts(ctx context.Context, resourceID uuid.UUID) ([]domain.Bolt, error) {
	var bolts []domain.Bolt = make([]domain.Bolt, 0)

	query := fmt.Sprintf(`%s SELECT
		bolt.*,
		resource.counters,
		mf.name AS manufacturer,
		mo.name AS model,
		ma.name AS material
	FROM tree
	INNER JOIN resource ON tree.resource_id = resource.leaf_of
	INNER JOIN bolt ON resource.id = bolt.id
	LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
	LEFT JOIN model mo ON bolt.model_id = mo.id
	LEFT JOIN material ma ON bolt.material_id = ma.id`, withTreeQuery())

	if err := sess.DB.Raw(query, resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}

func (sess Session) GetBolt(ctx context.Context, resourceID uuid.UUID) (*domain.Bolt, error) {
	var bolt domain.Bolt

	if err := sess.DB.Raw(`SELECT
			bolt.*,
			resource.counters,
			mf.name AS manufacturer,
			mo.name AS model,
			ma.name AS material
		FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
		LEFT JOIN model mo ON bolt.model_id = mo.id
		LEFT JOIN material ma ON bolt.material_id = ma.id
		WHERE bolt.id = ?`, resourceID).
		Scan(&bolt).Error; err != nil {
		return nil, err
	}

	if bolt.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &bolt, nil
}

func (sess Session) getBoltWithLock(resourceID uuid.UUID) (*domain.Bolt, error) {
	var bolt domain.Bolt

	if err := sess.DB.Raw(`SELECT * FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		WHERE bolt.id = ?
		FOR UPDATE`, resourceID).
		Scan(&bolt).Error; err != nil {
		return nil, err
	}

	if bolt.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &bolt, nil
}

func (sess Session) CreateBolt(ctx context.Context, bolt *domain.Bolt, parentResourceID uuid.UUID) error {
	bolt.UpdateCounters()

	resource := domain.Resource{
		ResourceBase: bolt.ResourceBase,
		Type:         domain.TypeBolt,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(ctx, &resource, parentResourceID); err != nil {
			return err
		}

		bolt.ID = resource.ID

		if err := sess.DB.Create(&bolt).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(ctx, bolt.ID, bolt.Counters); err != nil {
			return err
		}

		if refreshedBolt, err := sess.GetBolt(ctx, bolt.ID); err != nil {
			return err
		} else {
			*bolt = *refreshedBolt
		}

		if ancestors, err := sess.GetAncestors(ctx, bolt.ID); err != nil {
			return nil
		} else {
			bolt.Ancestors = ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteBolt(ctx context.Context, resourceID uuid.UUID) error {
	return sess.DeleteResource(ctx, resourceID)
}

func (sess Session) UpdateBolt(ctx context.Context, boltID uuid.UUID, updatedBolt domain.Bolt) (*domain.Bolt, error) {
	var refreshedBolt *domain.Bolt

	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getBoltWithLock(boltID)
		if err != nil {
			return err
		}

		updatedBolt.ID = original.ID
		updatedBolt.Counters = original.Counters
		updatedBolt.UpdateCounters()

		countersDifference := updatedBolt.Counters.Substract(original.Counters)

		if err := sess.TouchResource(ctx, boltID); err != nil {
			return err
		}

		if err := sess.DB.Select(
			"Type",
			"Position",
			"Installed",
			"Dismantled",
			"ManufacturerID",
			"ModelID",
			"MaterialID",
			"Diameter",
			"DiameterUnit").Updates(updatedBolt).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(ctx, boltID, countersDifference); err != nil {
			return err
		}

		refreshedBolt, err = sess.GetBolt(ctx, boltID)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return refreshedBolt, nil
}
