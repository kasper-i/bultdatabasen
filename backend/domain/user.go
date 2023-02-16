package domain

import (
	"context"
)

type UserRepository interface {
	Transactor

	GetUser(ctx context.Context, userID string) (User, error)
	SaveUser(ctx context.Context, user User) error
	InsertUser(ctx context.Context, user User) error
	GetUserNames(ctx context.Context) ([]User, error)
}

type AuthRepository interface {
	GetUserRoles(ctx context.Context, userID string) []ResourceRole
	InsertUserRole(ctx context.Context, userID string, role ResourceRole) error
}
