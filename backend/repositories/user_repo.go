package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Save(user).Error
}
