package usecases

import (
	"bultdatabasen/domain"
	"context"
)

type materialUsecase struct {
	sess *Session
}

func NewMaterialUsecase(sess *Session) domain.MaterialUsecase {
	return &materialUsecase{
		sess: sess,
	}
}

func (uc *materialUsecase) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	var materials []domain.Material = make([]domain.Material, 0)

	query := "SELECT * FROM material ORDER BY name ASC"

	if err := uc.sess.DB.Raw(query).Scan(&materials).Error; err != nil {
		return nil, err
	}

	return materials, nil
}
