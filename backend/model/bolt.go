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
	ParentID       string     `gorm:"->" json:"parentId"`
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

func (sess Session) GetBolts(resourceID string) ([]Bolt, error) {
	var bolts []Bolt = make([]Bolt, 0)

	resourceType := "bolt"

	query := fmt.Sprintf(`%s
	SELECT
		%s.*,
		cte.parent_id,
		mf.name AS manufacturer,
		mo.name AS model,
		ma.name AS material
	FROM cte
	INNER JOIN %s ON cte.id = %s.id
	LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
	LEFT JOIN model mo ON bolt.model_id = mo.id
	LEFT JOIN material ma ON bolt.material_id = ma.id
	WHERE cte.first <> TRUE`, buildDescendantsCTE(GetResourceDepth(resourceType)), resourceType, resourceType, resourceType)

	if err := sess.DB.Raw(query, resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}

func (sess Session) GetBolt(resourceID string) (*Bolt, error) {
	var bolt Bolt

	if err := sess.DB.Raw(`SELECT
			bolt.*,
			resource.parent_id,
			mf.name AS manufacturer,
			mo.name AS model,
			ma.name AS material
		FROM bolt
		LEFT JOIN resource ON bolt.id = resource.id
		LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
		LEFT JOIN model mo ON bolt.model_id = mo.id
		LEFT JOIN material ma ON bolt.material_id = ma.id
		WHERE bolt.id = ?`, resourceID).
		Scan(&bolt).Error; err != nil {
		return nil, err
	}

	if bolt.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &bolt, nil
}

func (sess Session) CreateBolt(bolt *Bolt, parentResourceID string) error {
	bolt.ID = uuid.Must(uuid.NewRandom()).String()
	bolt.ParentID = parentResourceID

	resource := Resource{
		ResourceBase: bolt.ResourceBase,
		Type:         "bolt",
		ParentID:     &parentResourceID,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&bolt).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func (sess Session) DeleteBolt(resourceID string) error {
	return sess.deleteResource(resourceID)
}

func (sess Session) UpdateBolt(boltID string, updatedBolt Bolt) (*Bolt, error) {
	var refreshedBolt *Bolt

	original, err := sess.GetBolt(boltID)
	if err != nil {
		return nil, err
	}

	original.Type = updatedBolt.Type
	original.Position = updatedBolt.Position
	original.Installed = updatedBolt.Installed
	original.Dismantled = updatedBolt.Dismantled
	original.ManufacturerID = updatedBolt.ManufacturerID
	original.ModelID = updatedBolt.ModelID
	original.MaterialID = updatedBolt.MaterialID
	original.Diameter = updatedBolt.Diameter
	original.DiameterUnit = updatedBolt.DiameterUnit

	err = sess.Transaction(func(sess Session) error {
		if err := sess.touchResource(boltID); err != nil {
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
			"DiameterUnit").Updates(original).Error; err != nil {
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
