package model

type AssignedRole struct {
	Role       string
	ResourceID string
}

func (sess Session) GetRoles(userID string) []AssignedRole {
	var roles []AssignedRole

	sess.DB.Raw(`SELECT resource_id, role
			FROM user
			RIGHT JOIN user_role ON user.id = user_role.user_id
			WHERE user.id = ?
	UNION
		SELECT resource_id, role
			FROM user_team
			RIGHT JOIN team_role ON user_team.team_id = team_role.team_id
			WHERE user_team.user_id = ?`, userID, userID).Scan(&roles)

	return roles
}
