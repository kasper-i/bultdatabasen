package repositories

import (
	"bultdatabasen/domain"
	"context"
)

func (store *psqlDatastore) GetUser(ctx context.Context, userID string) (domain.User, error) {
	var user domain.User

	if err := store.tx(ctx).First(&user, "id = ?", userID).Error; err != nil {
		return domain.User{}, err
	}

	return user, nil
}

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Save(user).Error
}

func (store *psqlDatastore) InsertUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Create(user).Error
}

func (store *psqlDatastore) GetUserNames(ctx context.Context) ([]domain.User, error) {
	var names []domain.User = make([]domain.User, 0)

	if err := store.tx(ctx).Raw(`SELECT id, first_name, SUBSTRING(last_name, 1, 1) AS last_name FROM "user"`).
		Scan(&names).Error; err != nil {
		return names, err
	}

	return names, nil
}
