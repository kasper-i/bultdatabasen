package domain

import (
	"context"

	"github.com/google/uuid"
)

type Team struct {
	ID   string `gorm:"primaryKey" json:"id"`
	Name string `gorm:"name" json:"name"`
}

func (Team) TableName() string {
	return "team"
}

type TeamUsecase interface {
	GetMaintainers(ctx context.Context, resourceID uuid.UUID) ([]Team, error)
}

type TeamRepository interface {
	GetTeamsByRole(ctx context.Context, resourceID uuid.UUID, role RoleType) ([]Team, error)
}
