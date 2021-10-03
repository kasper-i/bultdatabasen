package model

type Connection struct {
	RouteID    string `gorm:"primaryKey"`
	SrcPointID string `gorm:"primaryKey"`
	DstPointID string `gorm:"primaryKey"`
}

func (Connection) TableName() string {
	return "connection"
}

func (sess Session) CreateConnection(routeID, srcPointID, dstPointID string) error {
	return sess.DB.Create(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}

func (sess Session) DeleteConnection(routeID, srcPointID, dstPointID string) error {
	return sess.DB.Delete(Connection{RouteID: routeID, SrcPointID: srcPointID, DstPointID: dstPointID}).Error
}
