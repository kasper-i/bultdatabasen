package domain

import (
	"context"
	"database/sql/driver"
	"time"
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

type UserUsecase interface {
	GetUserRoles(ctx context.Context, userID string) ([]ResourceRole, error)
}

type UserRepository interface {
	Transactor

	SaveUser(ctx context.Context, user User) error
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
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
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
	}

	if user.FirstName != nil {
		author.FirstName = *user.FirstName
	}
	if user.LastName != nil {
		author.LastName = *user.LastName
	}
}
