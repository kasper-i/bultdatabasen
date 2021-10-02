package model

import (
	"gorm.io/gorm"
)

type Connection struct {
	RouteID    string `gorm:"primaryKey"`
	SrcPointID string `gorm:"primaryKey"`
	DstPointID string `gorm:"primaryKey"`
}

func (Connection) TableName() string {
	return "connection"
}

func CreateConnection(db *gorm.DB, routeID, srcPointID, dstPointID string) error {
	return db.Create(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func DeleteConnection(db *gorm.DB, routeID, srcPointID, dstPointID string) error {
	return db.Delete(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
