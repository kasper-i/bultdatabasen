package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetAreas(ctx context.Context, resourceID uuid.UUID) ([]domain.Area, error) {
	var areas []domain.Area = make([]domain.Area, 0)

	if err := store.tx(ctx).Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN area ON tree.resource_id = area.id
		INNER JOIN resource ON tree.resource_id = resource.id
		WHERE resource.id <> ?`,
		withTreeQuery()), resourceID, resourceID).Scan(&areas).Error; err != nil {
		return nil, err
	}

	return areas, nil
}

func (store *psqlDatastore) GetArea(ctx context.Context, resourceID uuid.UUID) (domain.Area, error) {
	var area domain.Area

	if err := store.tx(ctx).Raw(`SELECT * FROM area INNER JOIN resource ON area.id = resource.id WHERE area.id = ?`, resourceID).
		Scan(&area).Error; err != nil {
		return domain.Area{}, err
	}

	if area.ID == uuid.Nil {
		return domain.Area{}, gorm.ErrRecordNotFound
	}

	return area, nil
}

func (store *psqlDatastore) InsertArea(ctx context.Context, area domain.Area) error {
	return store.tx(ctx).Create(&area).Error
}
