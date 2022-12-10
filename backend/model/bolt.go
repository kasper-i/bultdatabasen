package model

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Bolt struct {
	ResourceBase
	Type           *string    `json:"type,omitempty"`
	Position       *string    `json:"position,omitempty"`
	Installed      *time.Time `json:"installed,omitempty"`
	Dismantled     *time.Time `json:"dismantled,omitempty"`
	ManufacturerID *string    `json:"manufacturerId,omitempty"`
	Manufacturer   *string    `gorm:"->" json:"manufacturer,omitempty"`
	ModelID        *string    `json:"modelId,omitempty"`
	Model          *string    `gorm:"->" json:"model,omitempty"`
	MaterialID     *string    `json:"materialId,omitempty"`
	Material       *string    `gorm:"->" json:"material,omitempty"`
	Diameter       *float32   `json:"diameter,omitempty"`
	DiameterUnit   *string    `json:"diameterUnit,omitempty"`
}

func (Bolt) TableName() string {
	return "bolt"
}

func (bolt *Bolt) UpdateCounters() {
	if bolt.Dismantled == nil {
		bolt.Counters.InstalledBolts = 1
	} else {
		bolt.Counters.InstalledBolts = 0
	}
}

func (sess Session) GetBolts(resourceID uuid.UUID) ([]Bolt, error) {
	var bolts []Bolt = make([]Bolt, 0)

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

func (sess Session) GetBolt(resourceID uuid.UUID) (*Bolt, error) {
	var bolt Bolt

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

func (sess Session) getBoltWithLock(resourceID uuid.UUID) (*Bolt, error) {
	var bolt Bolt

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

func (sess Session) CreateBolt(bolt *Bolt, parentResourceID uuid.UUID) error {
	bolt.UpdateCounters()

	resource := Resource{
		ResourceBase: bolt.ResourceBase,
		Type:         TypeBolt,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}

		bolt.ID = resource.ID

		if err := sess.DB.Create(&bolt).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(bolt.ID, bolt.Counters); err != nil {
			return err
		}

		if refreshedBolt, err := sess.GetBolt(bolt.ID); err != nil {
			return err
		} else {
			*bolt = *refreshedBolt
		}

		if ancestors, err := sess.GetAncestors(bolt.ID); err != nil {
			return nil
		} else {
			bolt.Ancestors = &ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteBolt(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}

func (sess Session) UpdateBolt(boltID uuid.UUID, updatedBolt Bolt) (*Bolt, error) {
	var refreshedBolt *Bolt

	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getBoltWithLock(boltID)
		if err != nil {
			return err
		}

		updatedBolt.ID = original.ID
		updatedBolt.Counters = original.Counters
		updatedBolt.UpdateCounters()

		countersDifference := updatedBolt.Counters.Substract(original.Counters)

		if err := sess.TouchResource(boltID); err != nil {
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

		if err := sess.updateCountersForResourceAndAncestors(boltID, countersDifference); err != nil {
			return err
		}

		refreshedBolt, err = sess.GetBolt(boltID)
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
