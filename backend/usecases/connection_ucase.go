package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (sess Session) CreateConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Create(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (sess Session) DeleteConnection(ctx context.Context, routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Delete(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
