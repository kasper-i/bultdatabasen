package domain

import "github.com/google/uuid"

type Material struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (Material) TableName() string {
	return "material"
}
