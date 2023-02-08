package domain

import (
	"context"

	"github.com/google/uuid"
)

type Route struct {
	ResourceBase
	Name      string  `json:"name"`
	AltName   *string `json:"altName,omitempty"`
	Year      *int32  `json:"year,omitempty"`
	Length    *int32  `json:"length,omitempty"`
	RouteType *string `json:"routeType,omitempty"`
}

func (Route) TableName() string {
	return "route"
}

func (route *Route) UpdateCounters() {
	route.Counters.Routes = 1
}

type RouteUsecase interface {
	GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]Route, error)
	GetRoute(ctx context.Context, resourceID uuid.UUID) (Route, error)
	CreateRoute(ctx context.Context, route Route, parentResourceID uuid.UUID) (Route, error)
	DeleteRoute(ctx context.Context, resourceID uuid.UUID) error
	UpdateRoute(ctx context.Context, routeID uuid.UUID, updatedRoute Route) (Route, error)
}

type RouteRepository interface {
	GetRoutes(ctx context.Context, resourceID uuid.UUID) ([]Route, error)
	GetRoute(ctx context.Context, resourceID uuid.UUID) (Route, error)
	GetRouteWithLock(ctx context.Context, resourceID uuid.UUID) (Route, error)
	InsertRoute(ctx context.Context, route Route) error
	SaveRoute(ctx context.Context, route Route) error
}
