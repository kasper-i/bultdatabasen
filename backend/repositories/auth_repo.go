package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) InsertUserRole(ctx context.Context, userID string, role domain.ResourceRole) error {
	return store.tx(ctx).Exec("INSERT INTO user_role VALUES (?, ?, ?)", userID, role.ResourceID, role.Role).Error
}
