package domain

import (
	"context"

	"github.com/google/uuid"
)

type RoleType string

const (
	RoleGuest RoleType = "guest"
	RoleOwner RoleType = "owner"
	RoleAdmin RoleType = "admin"
)

type PermissionType string

const (
	ReadPermission  PermissionType = "read"
	WritePermission PermissionType = "write"
)

type ResourceRole struct {
	Role       RoleType  `json:"role"`
	ResourceID uuid.UUID `json:"resourceId"`
}

type Authenticator interface {
	Authenticate(ctx context.Context) (User, error)
}

type Authorizer interface {
	HasPermission(ctx context.Context, user *User, resourceID uuid.UUID, permission PermissionType) error
}
