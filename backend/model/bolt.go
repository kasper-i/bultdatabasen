package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Bolt struct {
	ResourceBase
	Type     *string `json:"type,omitempty"`
	ParentID string  `gorm:"->" json:"parentId"`
}

func (Bolt) TableName() string {
	return "bolt"
}

func (sess Session) GetBolts(resourceID string) ([]Bolt, error) {
	var bolts []Bolt = make([]Bolt, 0)

	if err := sess.DB.Raw(getDescendantsQuery("bolt"), resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}

func (sess Session) GetBolt(resourceID string) (*Bolt, error) {
	var bolt Bolt

	if err := sess.DB.Raw(`SELECT * FROM bolt LEFT JOIN resource ON bolt.id = resource.id WHERE bolt.id = ?`, resourceID).
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
