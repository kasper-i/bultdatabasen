package model

import (
	"bultdatabasen/domain"
	"context"
)

func (sess Session) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	var manufacturers []domain.Manufacturer = make([]domain.Manufacturer, 0)

	query := "SELECT * FROM manufacturer ORDER BY name ASC"

	if err := sess.DB.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}
