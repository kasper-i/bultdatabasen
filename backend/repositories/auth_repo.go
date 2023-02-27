package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) GetUserRoles(ctx context.Context, userID string) ([]domain.ResourceRole, error) {
	var roles []domain.ResourceRole

	err := store.tx(ctx).Raw(`SELECT resource_id, role
			FROM "user" u
			INNER JOIN user_role ON u.id = user_role.user_id
			WHERE u.id = ?
	UNION
		SELECT resource_id, role
			FROM user_team
			INNER JOIN team_role ON user_team.team_id = team_role.team_id
			WHERE user_team.user_id = ?`, userID, userID).Scan(&roles).Error

	return roles, err
}

func (store *psqlDatastore) InsertUserRole(ctx context.Context, userID string, role domain.ResourceRole) error {
	return store.tx(ctx).Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, role.ResourceID, role.Role).Error
}
