package model

import (
	"gorm.io/gorm"
)

type Connection struct {
	SrcPointID string `gorm:"primaryKey"`
	DstPointID string `gorm:"primaryKey"`
}

func (Connection) TableName() string {
	return "connection"
}

func CreateConnection(db *gorm.DB, src, dst string) error {
	return db.Create(&Connection{SrcPointID: src, DstPointID: dst}).Error
}

func DeleteConnection(db *gorm.DB, src, dst string) error {
	return db.Delete(&Connection{SrcPointID: src, DstPointID: dst}).Error
}
