package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	var sectors []domain.Sector = make([]domain.Sector, 0)

	if err := store.tx(ctx).Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN sector ON tree.resource_id = sector.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func (store *psqlDatastore) GetSector(ctx context.Context, resourceID uuid.UUID) (domain.Sector, error) {
	var sector domain.Sector

	if err := store.tx(ctx).Raw(`SELECT * FROM sector INNER JOIN resource ON sector.id = resource.id WHERE sector.id = ?`, resourceID).
		Scan(&sector).Error; err != nil {
		return domain.Sector{}, err
	}

	if sector.ID == uuid.Nil {
		return domain.Sector{}, gorm.ErrRecordNotFound
	}

	return sector, nil
}

func (store *psqlDatastore) InsertSector(ctx context.Context, sector domain.Sector) error {
	return store.tx(ctx).Create(&sector).Error
}
