package domain

import (
	"context"

	"github.com/google/uuid"
)

type Material struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (Material) TableName() string {
	return "material"
}

type MaterialUsecase interface {
	GetMaterials(ctx context.Context) ([]Material, error)
}

type CatalogRepository interface {
	GetManufacturers(ctx context.Context) ([]Manufacturer, error)
	GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]Model, error)
	GetMaterials(ctx context.Context) ([]Material, error)
}
