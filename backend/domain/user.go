package domain

import (
	"context"

	"github.com/google/uuid"
)

type UserRepository interface {
	Transactor

	GetUser(ctx context.Context, userID string) (User, error)
	SaveUser(ctx context.Context, user User) error
	InsertUser(ctx context.Context, user User) error
	GetUserNames(ctx context.Context) ([]User, error)
	GetRoles(ctx context.Context, userID string) []ResourceRole
	InsertResourceAccess(ctx context.Context, resourceID uuid.UUID, userID string, role RoleType) error
}
