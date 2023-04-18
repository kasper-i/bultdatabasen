package repositories

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Save(user).Error
}

func (store *psqlDatastore) GetMaintainers(ctx context.Context, resourceIDs ...uuid.UUID) ([]string, error) {
	userIDs := make([]string, 0)

	query := `SELECT DISTINCT user_id
		FROM user_role WHERE role = 'owner' AND resource_id IN ?
		UNION
		SELECT DISTINCT user_id
		FROM team_role
		JOIN user_team ON team_role.team_id = user_team.team_id
		WHERE role = 'owner'
		AND resource_id IN ?`

	err := store.tx(ctx).Raw(query, resourceIDs, resourceIDs).Scan(&userIDs).Error

	return userIDs, err
}
