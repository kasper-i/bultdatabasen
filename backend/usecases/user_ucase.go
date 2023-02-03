package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type userUsecase struct {
	store         domain.Datastore
	authenticator domain.Authenticator
}

func NewUserUsecase(authenticator domain.Authenticator, store domain.Datastore) domain.UserUsecase {
	return &userUsecase{
		store:         store,
		authenticator: authenticator,
	}
}

func (uc *userUsecase) GetUser(ctx context.Context, userID string) (domain.User, error) {
	return uc.store.GetUser(ctx, userID)
}

func (uc *userUsecase) UpdateUser(ctx context.Context, user domain.User) (domain.User, error) {
	err := uc.store.SaveUser(ctx, user)
	return user, err
}

func (uc *userUsecase) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {
	err := uc.store.InsertUser(ctx, user)
	return user, err
}

func (uc *userUsecase) GetUserNames(ctx context.Context) ([]domain.User, error) {
	return uc.store.GetUserNames(ctx)
}
