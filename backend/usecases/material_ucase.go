package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type materialUsecase struct {
	repo domain.Datastore
}

func NewMaterialUsecase(store domain.Datastore) domain.MaterialUsecase {
	return &materialUsecase{
		repo: store,
	}
}

func (uc *materialUsecase) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	return uc.repo.GetMaterials(ctx)
}
