package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Trash struct {
	ResourceID  uuid.UUID `gorm:"primaryKey"`
	DeletedTime time.Time `gorm:"column:dtime"`
	DeletedByID string    `gorm:"column:duser_id"`
	OrigPath    *Path
	OrigLeafOf  *uuid.UUID
}

func (Trash) TableName() string {
	return "trash"
}

type TrashRepository interface {
	Transactor

	InsertTrash(ctx context.Context, trash Trash) error
}
