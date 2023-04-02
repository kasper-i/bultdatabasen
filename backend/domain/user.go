package domain

import (
	"context"
)

type UserUsecase interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
}

type UserRepository interface {
	Transactor

	InsertUser(ctx context.Context, user User) error
}

type AuthRepository interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
	InsertUserRole(ctx context.Context, userID string, role ResourceRole) error
}

type UserPool interface {
	GetUser(ctx context.Context, userID string) (User, error)
}
