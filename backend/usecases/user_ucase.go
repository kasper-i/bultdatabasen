package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type userUsecase struct {
	userRepo      domain.UserRepository
	authenticator domain.Authenticator
}

func NewUserUsecase(authenticator domain.Authenticator, userRepo domain.UserRepository) domain.UserUsecase {
	return &userUsecase{
		userRepo:      userRepo,
		authenticator: authenticator,
	}
}

func (uc *userUsecase) GetUser(ctx context.Context, userID string) (domain.User, error) {
	_, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.User{}, err
	}

	return uc.userRepo.GetUser(ctx, userID)
}

func (uc *userUsecase) UpdateUser(ctx context.Context, user domain.User) (domain.User, error) {
	_, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.User{}, err
	}

	err = uc.userRepo.SaveUser(ctx, user)
	return user, err
}

func (uc *userUsecase) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {
	_, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.User{}, err
	}

	err = uc.userRepo.InsertUser(ctx, user)
	return user, err
}

func (uc *userUsecase) GetUserNames(ctx context.Context) ([]domain.User, error) {
	return uc.userRepo.GetUserNames(ctx)
}
