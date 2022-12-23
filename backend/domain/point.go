package domain

import "github.com/google/uuid"

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
