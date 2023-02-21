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
	ID        uuid.UUID `gorm:"primaryKey" json:"id"`
	Ancestors Ancestors `gorm:"-" json:"ancestors,omitempty"`
	Counters  Counters  `gorm:"->" json:"counters"`
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

type ResourceWithParents struct {
	Resource
	Parents []Parent `json:"parents"`
}

type Ancestors []Resource

func (ancestors Ancestors) IDs() []uuid.UUID {
	identifiers := make([]uuid.UUID, len(ancestors))

	for idx, ancestors := range ancestors {
		identifiers[idx] = ancestors.ID
	}

	return identifiers
}

type ResourceUsecase interface {
	GetResource(ctx context.Context, resourceID uuid.UUID) (Resource, error)
	MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error
	GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	GetChildren(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	Search(ctx context.Context, name string) ([]ResourceWithParents, error)
}

type ResourceHelper interface {
	CreateResource(ctx context.Context, resource Resource, parentResourceID uuid.UUID, userID string) (Resource, error)
	DeleteResource(ctx context.Context, resourceID uuid.UUID, userID string) error
	MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error
	UpdateCounters(ctx context.Context, delta Counters, resourceIDs ...uuid.UUID) error
	GetAncestors(ctx context.Context, resourceID uuid.UUID) (Ancestors, error)
	TouchResource(ctx context.Context, resourceID uuid.UUID, userID string) error
	RenameResource(ctx context.Context, resourceID uuid.UUID, name, userID string) error
}

type Transactor interface {
	WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}

type ResourceRepository interface {
	Transactor

	GetAncestors(ctx context.Context, resourceID uuid.UUID) (Ancestors, error)
	GetChildren(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	GetParents(ctx context.Context, resourceIDs []uuid.UUID) ([]Parent, error)
	Search(ctx context.Context, name string) ([]ResourceWithParents, error)
	TouchResource(ctx context.Context, resourceID uuid.UUID, userID string) error
	GetResource(ctx context.Context, resourceID uuid.UUID) (Resource, error)
	GetResourceWithLock(ctx context.Context, resourceID uuid.UUID) (Resource, error)
	InsertResource(ctx context.Context, resource Resource) error
	OrphanResource(ctx context.Context, resourceID uuid.UUID) error
	RenameResource(ctx context.Context, resourceID uuid.UUID, name, userID string) error
	UpdateCounters(ctx context.Context, resourceID uuid.UUID, delta Counters) error
}
