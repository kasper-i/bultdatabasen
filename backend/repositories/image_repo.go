package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetImages(ctx context.Context, resourceID uuid.UUID) ([]domain.Image, error) {
	var images []domain.Image = make([]domain.Image, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s
		SELECT * FROM tree
		INNER JOIN resource ON tree.resource_id = resource.leaf_of
		INNER JOIN image ON resource.id = image.id`, withTreeQuery()), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (store *psqlDatastore) GetImageWithLock(imageID uuid.UUID) (domain.Image, error) {
	var image domain.Image

	if err := store.tx.Raw(`SELECT * FROM image INNER JOIN resource ON image.id = resource.id WHERE image.id = ? FOR UPDATE`, imageID).
		Scan(&image).Error; err != nil {
		return domain.Image{}, err
	}

	if image.ID == uuid.Nil {
		return domain.Image{}, gorm.ErrRecordNotFound
	}

	return image, nil
}

func (store *psqlDatastore) GetImage(ctx context.Context, imageID uuid.UUID) (domain.Image, error) {
	var image domain.Image

	if err := store.tx.Raw(`SELECT * FROM image WHERE image.id = ?`, imageID).
		Scan(&image).Error; err != nil {
		return domain.Image{}, err
	}

	if image.ID == uuid.Nil {
		return domain.Image{}, gorm.ErrRecordNotFound
	}

	return image, nil
}

func (store *psqlDatastore) InsertImage(ctx context.Context, image domain.Image) error {
	return store.tx.Create(image).Error
}

func (store *psqlDatastore) SaveImage(ctx context.Context, image domain.Image) error {
	return store.tx.Select("Rotation").Updates(image).Error
}
