package domain

import (
	"context"

	"github.com/google/uuid"
)

type Crag struct {
	ResourceBase
	Name string `json:"name"`
}

func (Crag) TableName() string {
	return "crag"
}

type CragUsecase interface {
	GetCrags(ctx context.Context, resourceID uuid.UUID) ([]Crag, error)
	GetCrag(ctx context.Context, resourceID uuid.UUID) (*Crag, error)
	CreateCrag(ctx context.Context, crag *Crag, parentResourceID uuid.UUID) error
	DeleteCrag(ctx context.Context, resourceID uuid.UUID) error
}
