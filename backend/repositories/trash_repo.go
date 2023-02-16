package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) InsertTrash(ctx context.Context, trash domain.Trash) error {
	return store.tx(ctx).Create(&trash).Error
}
