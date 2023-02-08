package domain

import (
	"context"

	"github.com/google/uuid"
)

type Area struct {
	ResourceBase
	Name string `json:"name"`
}

func (Area) TableName() string {
	return "area"
}

type AreaUsecase interface {
	GetAreas(ctx context.Context, resourceID uuid.UUID) ([]Area, error)
	GetArea(ctx context.Context, resourceID uuid.UUID) (Area, error)
	CreateArea(ctx context.Context, area Area, parentResourceID uuid.UUID) (Area, error)
	DeleteArea(ctx context.Context, resourceID uuid.UUID) error
}

type AreaRepository interface {
	GetAreas(ctx context.Context, resourceID uuid.UUID) ([]Area, error)
	GetArea(ctx context.Context, resourceID uuid.UUID) (Area, error)
	InsertArea(ctx context.Context, area Area) error
}
