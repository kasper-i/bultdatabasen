package domain

import (
	"context"
	"errors"
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

type ResourceManager interface {
	CreateResource(ctx context.Context, resource Resource, parentResourceID uuid.UUID, userID string) (Resource, error)
	DeleteResource(ctx context.Context, resourceID uuid.UUID, userID string) error
	MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error
	UpdateCounters(ctx context.Context, delta Counters, resourceID ...uuid.UUID) error
}

type ResourceRepository interface {
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
	GetTreePath(ctx context.Context, resourceID uuid.UUID) (Path, error)
	InsertTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error
	RemoveTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error
	MoveSubtree(ctx context.Context, subtree Path, newAncestralPath Path) error
	GetSubtreeLock(ctx context.Context, resourceID uuid.UUID) error
	InsertTrash(ctx context.Context, trash Trash) error
	UpdateCounters(ctx context.Context, resourceID uuid.UUID, delta Counters) error
}

type Datastore interface {
	WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error

	UserRepository
	ResourceRepository
	AreaRepository
	BoltRepository
	CragRepository
	RouteRepository
	SectorRepository
	TaskRepository
	ImageRepository
	PointRepository
	CatalogRepository
}

type ErrNotFound struct {
	ResourceID uuid.UUID
}

func (err *ErrNotFound) Error() string {
	return "Not found"
}

var (
	ErrIllegalAngle          = errors.New("Illegal image rotation angle")
	ErrUnknownImageSize      = errors.New("Unknown image size")
	ErrIllegalInsertPosition = errors.New("Illegal point insert position")
	ErrPointWithoutBolts     = errors.New("Point without bolts")
	ErrUnsupportedMimeType   = errors.New("Unsupported MIME type")
)
