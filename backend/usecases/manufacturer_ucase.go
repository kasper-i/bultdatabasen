package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type manufacturerUsecase struct {
	repo domain.Datastore
}

func NewManufacturerUsecase(store domain.Datastore) domain.ManufacturerUsecase {
	return &manufacturerUsecase{
		repo: store,
	}
}

func (uc *manufacturerUsecase) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	return uc.repo.GetManufacturers(ctx)
}

func (uc *manufacturerUsecase) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	return uc.repo.GetModels(ctx, manufacturerID)
}
