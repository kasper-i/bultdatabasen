package repositories

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (store *psqlDatastore) GetManufacturers(ctx context.Context) ([]domain.Manufacturer, error) {
	var manufacturers []domain.Manufacturer = make([]domain.Manufacturer, 0)

	query := "SELECT * FROM manufacturer ORDER BY name ASC"

	if err := store.tx.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}

func (store *psqlDatastore) GetModels(ctx context.Context, manufacturerID uuid.UUID) ([]domain.Model, error) {
	var models []domain.Model = make([]domain.Model, 0)

	query := "SELECT * FROM model where manufacturer_id = ? ORDER BY name ASC"

	if err := store.tx.Raw(query, manufacturerID).Scan(&models).Error; err != nil {
		return nil, err
	}

	return models, nil
}

func (store *psqlDatastore) GetMaterials(ctx context.Context) ([]domain.Material, error) {
	var materials []domain.Material = make([]domain.Material, 0)

	query := "SELECT * FROM material ORDER BY name ASC"

	if err := store.tx.Raw(query).Scan(&materials).Error; err != nil {
		return nil, err
	}

	return materials, nil
}
