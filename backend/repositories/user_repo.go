package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) InsertUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Create(user).Error
}
