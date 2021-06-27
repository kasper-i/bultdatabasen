package model

import (
	"bultdatabasen/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Point struct {
	ID       string   `gorm:"primaryKey" json:"id"`
	ParentID string   `gorm:"->" json:"parentId"`
	Outgoing []string `gorm:"->" json:"outgoing"`
	Incoming []string `gorm:"->" json:"incoming"`
}

type pointWithConnections struct {
	ID              string `gorm:"primaryKey" json:"id"`
	ParentID        string
	OutgoingPointID *string
	IncomingPointID *string
}

func (Point) TableName() string {
	return "point"
}

func GetPoints(db *gorm.DB, resourceID string) ([]Point, error) {
	var raw []pointWithConnections = make([]pointWithConnections, 0)
	var pointMap map[string]*Point = make(map[string]*Point)
	var points []Point = make([]Point, 0, len(pointMap))

	if err := db.Raw(`
		SELECT point.*, resource.parent_id, connection_outgoing.dst_point_id AS outgoing_point_id, connection_incoming.src_point_id AS incoming_point_id
		FROM (
				SELECT resource.id, resource.parent_id
				FROM resource
				WHERE resource.parent_id = ?
			UNION
				SELECT foster_care.id, foster_care.foster_parent_id AS parent_id
				FROM foster_care
				WHERE foster_care.foster_parent_id = ?
		) AS resource
		LEFT JOIN point ON point.id = resource.id
		LEFT JOIN connection connection_outgoing ON point.id = connection_outgoing.src_point_id
		LEFT JOIN connection connection_incoming ON point.id = connection_incoming.dst_point_id`, resourceID, resourceID).
		Scan(&raw).Error; err != nil {
		return nil, err
	}

	for _, point := range raw {
		var ok bool
		var p *Point

		if p, ok = pointMap[point.ID]; !ok {
			p = &Point{
				ID:       point.ID,
				ParentID: point.ParentID,
				Incoming: make([]string, 0),
				Outgoing: make([]string, 0),
			}

			pointMap[point.ID] = p
		}

		if point.IncomingPointID != nil {
			p.Incoming = append(p.Incoming, *point.IncomingPointID)
		}

		if point.OutgoingPointID != nil {
			p.Outgoing = append(p.Outgoing, *point.OutgoingPointID)
		}
	}

	for _, value := range pointMap {
		points = append(points, *value)
	}

	return points, nil
}

func CreatePoint(db *gorm.DB, point *Point, parentResourceID string) error {
	point.ParentID = parentResourceID

	if point.ID != "" {
		var childResource *Resource
		var err error

		if childResource, err = GetResource(db, point.ID); err != nil || childResource.Type != "point" {
			return utils.ErrIllegalChildResource
		}

		if _, err = GetRoute(db, parentResourceID); err != nil {
			return utils.ErrIllegalParentResource
		}

		if err = addFosterParent(db, *childResource, parentResourceID); err != nil {
			return err
		}

		return nil
	}

	point.ID = uuid.Must(uuid.NewRandom()).String()

	resource := Resource{
		ID:       point.ID,
		Name:     nil,
		Type:     "point",
		ParentID: &parentResourceID,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&point).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
