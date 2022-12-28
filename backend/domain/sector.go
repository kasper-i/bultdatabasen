package domain

import (
	"context"

	"github.com/google/uuid"
)

type Sector struct {
	ResourceBase
	Name string `json:"name"`
}

func (Sector) TableName() string {
	return "sector"
}

type SectorUsecase interface {
	GetSectors(ctx context.Context, resourceID uuid.UUID) ([]Sector, error)
	GetSector(ctx context.Context, resourceID uuid.UUID) (*Sector, error)
	CreateSector(ctx context.Context, sector *Sector, parentResourceID uuid.UUID) error
	DeleteSector(ctx context.Context, resourceID uuid.UUID) error
}
