package domain

import (
	"context"
)

type UserRepository interface {
	Transactor

	GetUsers(ctx context.Context) ([]User, error)
}

type AuthRepository interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
	InsertUserRole(ctx context.Context, userID string, role ResourceRole) error
}

type UserPool interface {
	GetUser(ctx context.Context, userID string) (User, error)
}
