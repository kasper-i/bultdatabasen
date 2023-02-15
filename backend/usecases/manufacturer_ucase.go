package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type manufacturerUsecase struct {
	catalogRepo domain.CatalogRepository
}

func NewManufacturerUsecase(catalogRepo domain.CatalogRepository) domain.ManufacturerUsecase {
	return &manufacturerUsecase{
		catalogRepo: catalogRepo,
	}
}

func (uc *manufacturerUsecase) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	return uc.catalogRepo.GetManufacturers(ctx)
}

func (uc *manufacturerUsecase) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	return uc.catalogRepo.GetModels(ctx, manufacturerID)
}
