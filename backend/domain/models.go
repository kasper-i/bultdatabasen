package domain

import "github.com/google/uuid"

type Model struct {
	ID             uuid.UUID `json:"id"`
	Name           string    `json:"name"`
	ManufacturerID uuid.UUID `json:"manufacturerId"`
	Type           *string   `json:"type,omitempty"`
	MaterialID     *string   `json:"materialId,omitempty"`
	Diameter       *float32  `json:"diameter,omitempty"`
	DiameterUnit   *string   `json:"diameterUnit,omitempty"`
}

func (Model) TableName() string {
	return "model"
}
