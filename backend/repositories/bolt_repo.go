package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetBolts(ctx context.Context, resourceID uuid.UUID) ([]domain.Bolt, error) {
	var bolts []domain.Bolt = make([]domain.Bolt, 0)

	query := fmt.Sprintf(`%s SELECT
		bolt.*,
		resource.leaf_of AS parent_id,
		resource.counters,
		mf.name AS manufacturer,
		mo.name AS model,
		ma.name AS material
	FROM tree
	INNER JOIN resource ON tree.resource_id = resource.leaf_of
	INNER JOIN bolt ON resource.id = bolt.id
	LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
	LEFT JOIN model mo ON bolt.model_id = mo.id
	LEFT JOIN material ma ON bolt.material_id = ma.id`, withTreeQuery())

	if err := store.tx(ctx).Raw(query, resourceID).Scan(&bolts).Error; err != nil {
		return nil, err
	}

	return bolts, nil
}
func (store *psqlDatastore) GetBolt(ctx context.Context, resourceID uuid.UUID) (domain.Bolt, error) {
	var bolt domain.Bolt

	if err := store.tx(ctx).Raw(`SELECT
			bolt.*,
			resource.leaf_of AS parent_id,
			resource.counters,
			mf.name AS manufacturer,
			mo.name AS model,
			ma.name AS material
		FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		LEFT JOIN manufacturer mf ON bolt.manufacturer_id = mf.id
		LEFT JOIN model mo ON bolt.model_id = mo.id
		LEFT JOIN material ma ON bolt.material_id = ma.id
		WHERE bolt.id = ?`, resourceID).
		Scan(&bolt).Error; err != nil {
		return bolt, err
	}

	if bolt.ID == uuid.Nil {
		return bolt, gorm.ErrRecordNotFound
	}

	return bolt, nil
}

func (store *psqlDatastore) GetBoltWithLock(ctx context.Context, resourceID uuid.UUID) (domain.Bolt, error) {
	var bolt domain.Bolt

	if err := store.tx(ctx).Raw(`SELECT * FROM bolt
		INNER JOIN resource ON bolt.id = resource.id
		WHERE bolt.id = ?
		FOR UPDATE`, resourceID).
		Scan(&bolt).Error; err != nil {
		return bolt, err
	}

	if bolt.ID == uuid.Nil {
		return bolt, gorm.ErrRecordNotFound
	}

	return bolt, nil
}

func (store *psqlDatastore) InsertBolt(ctx context.Context, bolt domain.Bolt) error {
	return store.tx(ctx).Create(bolt).Error
}

func (store *psqlDatastore) SaveBolt(ctx context.Context, bolt domain.Bolt) error {
	return store.tx(ctx).Select(
		"Type",
		"Position",
		"Installed",
		"Dismantled",
		"ManufacturerID",
		"ModelID",
		"MaterialID",
		"Diameter",
		"DiameterUnit").Updates(bolt).Error
}
