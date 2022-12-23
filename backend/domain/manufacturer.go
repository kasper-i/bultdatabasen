package domain

import "github.com/google/uuid"

type Manufacturer struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (Manufacturer) TableName() string {
	return "manufacturer"
}
