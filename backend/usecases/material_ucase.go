package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type materialUsecase struct {
	store domain.Datastore
}

func NewMaterialUsecase(store domain.Datastore) domain.MaterialUsecase {
	return &materialUsecase{
		store: store,
	}
}

func (uc *materialUsecase) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	return uc.store.GetMaterials(ctx)
}
