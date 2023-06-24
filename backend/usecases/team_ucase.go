package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type teamUsecase struct {
	teamRepo domain.TeamRepository
}

func NewTeamUsecase(teamRepo domain.TeamRepository) domain.TeamUsecase {
	return &teamUsecase{
		teamRepo: teamRepo,
	}
}

func (uc *teamUsecase) GetMaintainers(ctx context.Context, resourceID uuid.UUID) ([]domain.Team, error) {
	return uc.teamRepo.GetTeamsByRole(ctx, resourceID, domain.RoleMaintainer)
}
