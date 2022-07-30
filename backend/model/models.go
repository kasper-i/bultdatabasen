package model

import (
	"fmt"
)

type Model struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	ManufacturerID string  `json:"manufacturerId"`
	Type           *string `json:"type,omitempty"`
	MaterialID     *string `json:"materialId,omitempty"`
	Diameter       *int    `json:"diameter,omitempty"`
}

func (Model) TableName() string {
	return "model"
}

func (sess Session) GetModels(manufacturerID string) ([]Model, error) {
	var models []Model = make([]Model, 0)

	query := fmt.Sprintf("SELECT * FROM model where manufacturer_id = ? ORDER BY name ASC")

	if err := sess.DB.Raw(query, manufacturerID).Scan(&models).Error; err != nil {
		return nil, err
	}

	return models, nil
}
