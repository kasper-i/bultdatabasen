package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type userUsecase struct {
	authenticator domain.Authenticator
	userRepo      domain.UserRepository
	authRepo      domain.AuthRepository
}

func NewUserUsecase(authenticator domain.Authenticator, authRepo domain.AuthRepository, userRepo domain.UserRepository) domain.UserUsecase {
	return &userUsecase{
		authenticator: authenticator,
		userRepo:      userRepo,
		authRepo:      authRepo,
	}
}

func (uc *userUsecase) GetUserRoles(ctx context.Context, userID string) ([]domain.ResourceRole, error) {
	authenticatedUser, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return nil, err
	}

	if userID != authenticatedUser.ID {
		return nil, &domain.ErrNotAuthorized{}
	}

	return uc.authRepo.GetUserRoles(ctx, userID)
}
