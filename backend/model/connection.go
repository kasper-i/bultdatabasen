package model

import "github.com/google/uuid"

type Connection struct {
	RouteID    uuid.UUID `gorm:"primaryKey"`
	SrcPointID uuid.UUID `gorm:"primaryKey"`
	DstPointID uuid.UUID `gorm:"primaryKey"`
}

func (Connection) TableName() string {
	return "connection"
}

func (sess Session) CreateConnection(routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Create(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (sess Session) DeleteConnection(routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Delete(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
