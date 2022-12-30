package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type manufacturerUsecase struct {
	store domain.Datastore
}

func NewManufacturerUsecase(store domain.Datastore) domain.ManufacturerUsecase {
	return &manufacturerUsecase{
		store: store,
	}
}

func (uc *manufacturerUsecase) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	return uc.store.GetManufacturers(ctx)
}

func (uc *manufacturerUsecase) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	return uc.store.GetModels(ctx, manufacturerID)
}
