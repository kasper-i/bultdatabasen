package domain

import (
	"context"
	"errors"
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
	WritePermission                = "write"
)

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     *string   `json:"email,omitempty"`
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	FirstSeen time.Time `json:"firstSeen,omitempty"`
}

func (User) TableName() string {
	return "user"
}

type ResourceRole struct {
	Role       RoleType  `json:"role"`
	ResourceID uuid.UUID `json:"resourceID"`
}

type UserUsecase interface {
	GetUser(ctx context.Context, userID string) (User, error)
	UpdateUser(ctx context.Context, user User) (User, error)
	CreateUser(ctx context.Context, user User) (User, error)
	GetUserNames(ctx context.Context) ([]User, error)
}

type Authenticator interface {
	Authenticate(ctx context.Context) (User, error)
}

type Authorizer interface {
	HasPermission(ctx context.Context, user *User, resourceID uuid.UUID, permission PermissionType) error
}

var (
	ErrTokenExpired     = errors.New("Token is expired")
	ErrUnexpectedIssuer = errors.New("Unexpected issuer")
	ErrNotAuthenticated = errors.New("Not authenticated")
)

type ErrNotAuthorized struct {
	ResourceID uuid.UUID
	Permission PermissionType
}

func (err *ErrNotAuthorized) Error() string {
	return "Not authorized"
}
