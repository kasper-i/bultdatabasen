package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetPointConnections(ctx context.Context, routeID uuid.UUID) ([]domain.PointConnection, error) {
	var connections []domain.PointConnection = make([]domain.PointConnection, 0)

	err := store.tx.Raw(`
		SELECT connection.*
		FROM connection
		WHERE route_id = ?`, routeID).Scan(&connections).Error

	return connections, err
}

func (store *psqlDatastore) GetPointWithLock(ctx context.Context, pointID uuid.UUID) (domain.Point, error) {
	var point domain.Point

	if err := store.tx.Raw(`SELECT * FROM point INNER JOIN resource ON point.id = resource.id WHERE point.id = ? FOR UPDATE`, pointID).
		Scan(&point).Error; err != nil {
		return domain.Point{}, err
	}

	if point.ID == uuid.Nil {
		return domain.Point{}, gorm.ErrRecordNotFound
	}

	return point, nil
}

func (store *psqlDatastore) GetPoints(ctx context.Context, resourceID uuid.UUID) ([]domain.Point, error) {
	var points []domain.Point = make([]domain.Point, 0)

	if err := store.tx.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN point ON tree.resource_id = point.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&points).Error; err != nil {
		return nil, err
	}

	return points, nil
}

func (store *psqlDatastore) InsertPoint(ctx context.Context, point domain.Point) error {
	return store.tx.Create(&point).Error
}

func (store *psqlDatastore) CreatePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return store.tx.Create(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (store *psqlDatastore) DeletePointConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return store.tx.Delete(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
