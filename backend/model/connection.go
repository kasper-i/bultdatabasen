package model

import (
	"bultdatabasen/domain"

	"github.com/google/uuid"
)

func (sess Session) CreateConnection(routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Create(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (sess Session) DeleteConnection(routeID, srcPointID, dstPointID uuid.UUID) error {
	return sess.DB.Delete(domain.PointConnection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
