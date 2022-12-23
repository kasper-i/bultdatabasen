package model

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetCrags(ctx context.Context, resourceID uuid.UUID) ([]domain.Crag, error) {
	var crags []domain.Crag = make([]domain.Crag, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN crag ON tree.resource_id = crag.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&crags).Error; err != nil {
		return nil, err
	}

	return crags, nil
}

func (sess Session) GetCrag(ctx context.Context, resourceID uuid.UUID) (*domain.Crag, error) {
	var crag domain.Crag

	if err := sess.DB.Raw(`SELECT * FROM crag INNER JOIN resource ON crag.id = resource.id WHERE crag.id = ?`, resourceID).
		Scan(&crag).Error; err != nil {
		return nil, err
	}

	if crag.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &crag, nil
}

func (sess Session) CreateCrag(ctx context.Context, crag *domain.Crag, parentResourceID uuid.UUID) error {
	resource := domain.Resource{
		Name: &crag.Name,
		Type: domain.TypeCrag,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(ctx, &resource, parentResourceID); err != nil {
			return err
		}

		crag.ID = resource.ID

		if err := sess.DB.Create(&crag).Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(ctx, crag.ID); err != nil {
			return nil
		} else {
			crag.Ancestors = ancestors
		}

		return nil
	})

	return err
}

func (sess Session) DeleteCrag(ctx context.Context, resourceID uuid.UUID) error {
	return sess.DeleteResource(ctx, resourceID)
}
