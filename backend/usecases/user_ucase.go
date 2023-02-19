package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type userUsecase struct {
	userRepo domain.UserRepository
}

func NewUserUsecase(authenticator domain.Authenticator, userRepo domain.UserRepository) domain.UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

func (uc *userUsecase) GetUsers(ctx context.Context) ([]domain.User, error) {
	users, err := uc.userRepo.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	for _, user := range users {
		user.Email = nil
	}

	return users, nil
}
