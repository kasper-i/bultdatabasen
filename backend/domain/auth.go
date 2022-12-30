package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
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
	Role       string    `json:"role"`
	ResourceID uuid.UUID `json:"resourceID"`
}

type UserUsecase interface {
	GetUser(ctx context.Context, userID string) (User, error)
	UpdateUser(ctx context.Context, user User) (User, error)
	CreateUser(ctx context.Context, user User) (User, error)
	GetUserNames(ctx context.Context) ([]User, error)
}