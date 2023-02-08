package repositories

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (store *psqlDatastore) GetUser(ctx context.Context, userID string) (domain.User, error) {
	var user domain.User

	if err := store.tx.First(&user, "id = ?", userID).Error; err != nil {
		return domain.User{}, err
	}

	return user, nil
}

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx.Save(user).Error
}

func (store *psqlDatastore) InsertUser(ctx context.Context, user domain.User) error {
	return store.tx.Create(user).Error
}

func (store *psqlDatastore) GetUserNames(ctx context.Context) ([]domain.User, error) {
	var names []domain.User = make([]domain.User, 0)

	if err := store.tx.Raw(`SELECT id, first_name, SUBSTRING(last_name, 1, 1) AS last_name FROM "user"`).
		Scan(&names).Error; err != nil {
		return names, err
	}

	return names, nil
}

func (store *psqlDatastore) GetRoles(ctx context.Context, userID string) []domain.ResourceRole {
	var roles []domain.ResourceRole

	store.tx.Raw(`SELECT resource_id, role
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

func (store *psqlDatastore) InsertResourceAccess(ctx context.Context, resourceID uuid.UUID, userID string, role domain.RoleType) error {
	return store.tx.Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, resourceID, role).Error
}
