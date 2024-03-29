package domain

import (
	"context"
	"database/sql/driver"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     *string   `gorm:"-" json:"email,omitempty"`
	FirstName *string   `gorm:"-" json:"firstName,omitempty"`
	LastName  *string   `gorm:"-" json:"lastName,omitempty"`
	FirstSeen time.Time `gorm:"-" json:"firstSeen,omitempty"`
}

func (User) TableName() string {
	return "user"
}

type UserUsecase interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
}

type UserRepository interface {
	Transactor

	SaveUser(ctx context.Context, user User) error
	GetUsersByRole(ctx context.Context, resourceID uuid.UUID, role RoleType) ([]User, error)
}

type AuthRepository interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
	InsertUserRole(ctx context.Context, userID string, role ResourceRole) error
}

type UserPool interface {
	GetUser(ctx context.Context, userID string) (User, error)
}

type Author struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

func (author *Author) Scan(value interface{}) error {
	author.ID = value.(string)
	return nil
}

func (author Author) Value() (driver.Value, error) {
	return author.ID, nil
}

func (author *Author) LoadName(ctx context.Context, userPool UserPool) {
	user, err := userPool.GetUser(ctx, author.ID)
	if err != nil {
		return
	}

	if user.FirstName != nil {
		author.FirstName = *user.FirstName
	}
	if user.LastName != nil {
		author.LastName = *user.LastName
	}
}
