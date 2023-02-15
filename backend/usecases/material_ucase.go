package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type materialUsecase struct {
	catalogRepo domain.CatalogRepository
}

func NewMaterialUsecase(catalogRepo domain.CatalogRepository) domain.MaterialUsecase {
	return &materialUsecase{
		catalogRepo: catalogRepo,
	}
}

func (uc *materialUsecase) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	return uc.catalogRepo.GetMaterials(ctx)
}
