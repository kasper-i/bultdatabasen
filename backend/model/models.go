package model

import "github.com/google/uuid"

type Model struct {
ID uuid.UUID   `json:"id"`
	Name           string   `json:"name"`
	ManufacturerID uuid.UUID   `json:"manufacturerId"`
	Type           *string  `json:"type,omitempty"`
	MaterialID     *string  `json:"materialId,omitempty"`
	Diameter       *float32 `json:"diameter,omitempty"`
	DiameterUnit   *string  `json:"diameterUnit,omitempty"`
}

func (Model) TableName() string {
	return "model"
}

func (sess Session) GetModels(manufacturerID uuid.UUID) ([]Model, error) {
	var models []Model = make([]Model, 0)

	query := "SELECT * FROM model where manufacturer_id = ? ORDER BY name ASC"

	if err := sess.DB.Raw(query, manufacturerID).Scan(&models).Error; err != nil {
		return nil, err
	}

	return models, nil
}
