package domain

import (
	"context"
	"time"

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

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     *string   `json:"-"`
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	FirstSeen time.Time `json:"firstSeen,omitempty"`
}

func (User) TableName() string {
	return "user"
}

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
