package model

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (sess Session) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	var models []domain.Model = make([]domain.Model, 0)

	query := "SELECT * FROM model where manufacturer_id = ? ORDER BY name ASC"

	if err := sess.DB.Raw(query, manufacturerID).Scan(&models).Error; err != nil {
		return nil, err
	}

	return models, nil
}
