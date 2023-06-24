package domain

import (
	"context"

	"github.com/google/uuid"
)

type Manufacturer struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (Manufacturer) TableName() string {
	return "manufacturer"
}

type ManufacturerUsecase interface {
	GetManufacturers(ctx context.Context) ([]Manufacturer, error)
	GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]Model, error)
}
