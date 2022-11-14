package model

type ResourceRole struct {
	Role       string `json:"role"`
	ResourceID string `json:"resourceID"`
}

func (sess Session) GetRoles(userID string) []ResourceRole {
	var roles []ResourceRole

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
