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

type PointRepository interface {
	GetPointConnections(ctx context.Context, routeID uuid.UUID) ([]PointConnection, error)
	GetPointWithLock(ctx context.Context, pointID uuid.UUID) (Point, error)
	GetPoints(ctx context.Context, resourceID uuid.UUID) ([]Point, error)
	InsertPoint(ctx context.Context, point Point) error
	CreatePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error
	DeletePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error
}
