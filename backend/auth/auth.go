package auth

import (
	"gorm.io/gorm"
)

type AssignedRole struct {
	Role       string
	ResourceID string
}

func GetRoles(db *gorm.DB, userID string) []AssignedRole {
	var roles []AssignedRole

	db.Raw(`SELECT resource_id, role
			FROM user
			LEFT JOIN user_role ON user.id = user_role.user_id
			WHERE user.id = ?
	UNION
		SELECT resource_id, role
			FROM user_team
			LEFT JOIN team_role ON user_team.team_id = team_role.team_id
			WHERE user_team.user_id = ?`, userID, userID).Scan(&roles)

	return roles
}
