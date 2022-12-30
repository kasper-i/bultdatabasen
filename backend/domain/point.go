package domain

import (
	"context"

	"github.com/google/uuid"
)

type Point struct {
	ResourceBase
	Parents []Parent `gorm:"-" json:"parents"`
	Number  int      `gorm:"-" json:"number"`
	Anchor  bool     `json:"anchor"`
}

func (Point) TableName() string {
	return "point"
}

type PointConnection struct {
	RouteID    uuid.UUID `gorm:"primaryKey"`
	SrcPointID uuid.UUID `gorm:"primaryKey"`
	DstPointID uuid.UUID `gorm:"primaryKey"`
}

func (PointConnection) TableName() string {
	return "connection"
}

type InsertPosition struct {
	PointID uuid.UUID `json:"pointId"`
	Order   string    `json:"order"`
}

type PointUsecase interface {
	GetPoints(ctx context.Context, resourceID uuid.UUID) ([]Point, error)
	AttachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID, position *InsertPosition, anchor bool, bolts []Bolt) (Point, error)
	DetachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID) error
}
