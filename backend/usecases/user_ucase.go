package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type userUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
}

func NewUserUsecase(authenticator domain.Authenticator, store domain.Datastore) domain.UserUsecase {
	return &userUsecase{
		repo:          store,
		authenticator: authenticator,
	}
}

func (uc *userUsecase) GetUser(ctx context.Context, userID string) (domain.User, error) {
	return uc.repo.GetUser(ctx, userID)
}

func (uc *userUsecase) UpdateUser(ctx context.Context, user domain.User) (domain.User, error) {
	err := uc.repo.SaveUser(ctx, user)
	return user, err
}

func (uc *userUsecase) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {
	err := uc.repo.InsertUser(ctx, user)
	return user, err
}

func (uc *userUsecase) GetUserNames(ctx context.Context) ([]domain.User, error) {
	return uc.repo.GetUserNames(ctx)
}
