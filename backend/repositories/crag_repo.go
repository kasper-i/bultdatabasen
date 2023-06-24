package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	var crags []domain.Crag = make([]domain.Crag, 0)

	if err := store.tx(ctx).Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN crag ON tree.resource_id = crag.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func (store *psqlDatastore) GetCrag(ctx context.Context, resourceID uuid.UUID) (domain.Crag, error) {
	var crag domain.Crag

	if err := store.tx(ctx).Raw(`SELECT * FROM crag INNER JOIN resource ON crag.id = resource.id WHERE crag.id = ?`, resourceID).
		Scan(&crag).Error; err != nil {
		return domain.Crag{}, err
	}

	if crag.ID == uuid.Nil {
		return domain.Crag{}, gorm.ErrRecordNotFound
	}

	return crag, nil
}

func (store *psqlDatastore) InsertCrag(ctx context.Context, crag domain.Crag) error {
	return store.tx(ctx).Create(&crag).Error
}
