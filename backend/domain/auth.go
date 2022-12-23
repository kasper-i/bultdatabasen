package domain

import (
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
