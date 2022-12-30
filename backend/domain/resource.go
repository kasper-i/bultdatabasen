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
	GetResource(ctx context.Context, resourceID uuid.UUID) (Resource, error)
	MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error
	GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	GetChildren(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
	Search(ctx context.Context, name string) ([]ResourceWithParents, error)
}

type ResourceService interface {
}

type Datastore interface {
	Transaction(fn func(Datastore) error) error

	GetUser(ctx context.Context, userID string) (User, error)
	SaveUser(ctx context.Context, user User) error
	InsertUser(ctx context.Context, user User) error
	GetUserNames(ctx context.Context) ([]User, error)
	GetRoles(ctx context.Context, userID string) []ResourceRole
	InsertResourceAccess(ctx context.Context, resourceID uuid.UUID, userID, role string) error

	GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]Resource, error)
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

	GetAreas(ctx context.Context, resourceID uuid.UUID) ([]Area, error)
	GetArea(ctx context.Context, resourceID uuid.UUID) (Area, error)
	InsertArea(ctx context.Context, area Area) error

	GetBolts(ctx context.Context, resourceID uuid.UUID) ([]Bolt, error)
	GetBolt(ctx context.Context, resourceID uuid.UUID) (Bolt, error)
	GetBoltWithLock(ctx context.Context, resourceID uuid.UUID) (Bolt, error)
	InsertBolt(ctx context.Context, bolt Bolt) error
	SaveBolt(ctx context.Context, bolt Bolt) error

	GetCrags(ctx context.Context, resourceID uuid.UUID) ([]Crag, error)
	GetCrag(ctx context.Context, resourceID uuid.UUID) (Crag, error)
	InsertCrag(ctx context.Context, crag Crag) error

	GetManufacturers(ctx context.Context) ([]Manufacturer, error)
	GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]Model, error)
	GetMaterials(ctx context.Context) ([]Material, error)

	GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]Route, error)
	GetRoute(ctx context.Context, resourceID uuid.UUID) (Route, error)
	GetRouteWithLock(resourceID uuid.UUID) (Route, error)
	InsertRoute(ctx context.Context, route Route) error
	SaveRoute(ctx context.Context, route Route) error

	GetSectors(ctx context.Context, resourceID uuid.UUID) ([]Sector, error)
	GetSector(ctx context.Context, resourceID uuid.UUID) (Sector, error)
	InsertSector(ctx context.Context, sector Sector) error

	GetTasks(ctx context.Context, resourceID uuid.UUID, pagination Pagination, statuses []string) ([]Task, Meta, error)
	GetTask(ctx context.Context, resourceID uuid.UUID) (Task, error)
	GetTaskWithLock(resourceID uuid.UUID) (Task, error)
	InsertTask(ctx context.Context, task Task) error
	SaveTask(ctx context.Context, task Task) error

	GetImages(ctx context.Context, resourceID uuid.UUID) ([]Image, error)
	GetImageWithLock(imageID uuid.UUID) (Image, error)
	GetImage(ctx context.Context, imageID uuid.UUID) (Image, error)
	InsertImage(ctx context.Context, image Image) error
	SaveImage(ctx context.Context, image Image) error

	GetPointConnections(ctx context.Context, routeID uuid.UUID) ([]PointConnection, error)
	GetPointWithLock(ctx context.Context, pointID uuid.UUID) (Point, error)
	GetPoints(ctx context.Context, resourceID uuid.UUID) ([]Point, error)
	InsertPoint(ctx context.Context, point Point) error
	CreatePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error
	DeletePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error
}
