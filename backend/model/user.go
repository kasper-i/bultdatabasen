package model

import (
	"bultdatabasen/domain"
	"context"
)

func (sess Session) GetUser(ctx context.Context, userID string) (*domain.User, error) {
	var user domain.User

	if err := sess.DB.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (sess Session) UpdateUser(ctx context.Context, user *domain.User) error {
	return sess.DB.Save(&user).Error
}

func (sess Session) CreateUser(ctx context.Context, user *domain.User) error {
	return sess.DB.Create(&user).Error
}

func (sess Session) GetUserNames(ctx context.Context) ([]domain.User, error) {
	var names []domain.User = make([]domain.User, 0)

	if err := sess.DB.Raw(`SELECT id, first_name, SUBSTRING(last_name, 1, 1) AS last_name FROM "user"`).
		Scan(&names).Error; err != nil {
		return names, err
	}

	return names, nil
}
