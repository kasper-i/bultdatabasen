package model

import (
	"bultdatabasen/domain"
	"context"
)

func (sess Session) GetRoles(ctx context.Context, userID string) []domain.ResourceRole {
	var roles []domain.ResourceRole

	sess.DB.Raw(`SELECT resource_id, role
			FROM "user" u
			INNER JOIN user_role ON u.id = user_role.user_id
			WHERE u.id = ?
	UNION
		SELECT resource_id, role
			FROM user_team
			INNER JOIN team_role ON user_team.team_id = team_role.team_id
			WHERE user_team.user_id = ?`, userID, userID).Scan(&roles)

	return roles
}
