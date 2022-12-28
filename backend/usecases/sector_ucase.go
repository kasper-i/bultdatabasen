package usecases

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetSectors(ctx context.Context, resourceID uuid.UUID) ([]domain.Sector, error) {
	var sectors []domain.Sector = make([]domain.Sector, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN sector ON tree.resource_id = sector.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&sectors).Error; err != nil {
		return nil, err
	}

	return sectors, nil
}

func (sess Session) GetSector(ctx context.Context, resourceID uuid.UUID) (*domain.Sector, error) {
	var sector domain.Sector

	if err := sess.DB.Raw(`SELECT * FROM sector INNER JOIN resource ON sector.id = resource.id WHERE sector.id = ?`, resourceID).
		Scan(&sector).Error; err != nil {
		return nil, err
	}

	if sector.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &sector, nil
}

func (sess Session) CreateSector(ctx context.Context, sector *domain.Sector, parentResourceID uuid.UUID) error {
	resource := domain.Resource{
		Name: &sector.Name,
		Type: domain.TypeSector,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(ctx, &resource, parentResourceID); err != nil {
			return err
		}

		sector.ID = resource.ID

		if err := sess.DB.Create(&sector).Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(ctx, sector.ID); err != nil {
			return nil
		} else {
			sector.Ancestors = ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteSector(ctx context.Context, resourceID uuid.UUID) error {
	return sess.DeleteResource(ctx, resourceID)
}
