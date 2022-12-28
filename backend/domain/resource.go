package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const RootID = "7ea1df97-df3a-436b-b1d2-b211f1b9b363"

type ResourceType string

const (
	TypeRoot    ResourceType = "root"
	TypeArea    ResourceType = "area"
	TypeCrag    ResourceType = "crag"
	TypeSector  ResourceType = "sector"
	TypeRoute   ResourceType = "route"
	TypePoint   ResourceType = "point"
	TypeBolt    ResourceType = "bolt"
	TypeImage   ResourceType = "image"
	TypeComment ResourceType = "comment"
	TypeTask    ResourceType = "task"
)

type ResourceBase struct {
	ID        uuid.UUID  `gorm:"primaryKey" json:"id"`
	Ancestors []Resource `gorm:"-" json:"ancestors,omitempty"`
	Counters  Counters   `gorm:"->" json:"counters"`
}

type Resource struct {
	ResourceBase
	Name            *string      `json:"name,omitempty"`
	Type            ResourceType `json:"type"`
	LeafOf          *uuid.UUID   `json:"leafOf,omitempty"`
	BirthTime       time.Time    `gorm:"column:btime" json:"-"`
	ModifiedTime    time.Time    `gorm:"column:mtime" json:"-"`
	CreatorID       string       `gorm:"column:buser_id" json:"-"`
	LastUpdatedByID string       `gorm:"column:muser_id" json:"-"`
}

func (Resource) TableName() string {
	return "resource"
}

type Parent struct {
	ID      uuid.UUID    `json:"id"`
	Name    *string      `json:"name"`
	Type    ResourceType `json:"type"`
	ChildID uuid.UUID    `json:"-"`
}

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

type ResourceWithParents struct {
	Resource
	Parents []Parent `json:"parents"`
}

type ResourceUsecase interface {
	GetResource(ctx context.Context, resourceID uuid.UUID) (*Resource, error)
	MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error
	GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	GetChildren(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	Search(ctx context.Context, name string) ([]ResourceWithParents, error)
}
