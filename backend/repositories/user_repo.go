package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) GetUsers(ctx context.Context) ([]domain.User, error) {
	var users []domain.User = make([]domain.User, 0)

	if err := store.tx(ctx).Raw(`SELECT * FROM "user"`).Scan(&users).Error; err != nil {
		return users, err
	}

	return users, nil
}
