package model

import (
	"bultdatabasen/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Point struct {
	ID       string     `gorm:"primaryKey" json:"id"`
	Parents  **[]Parent `gorm:"-" json:"parents"`
	Bolts    **[]Bolt   `gorm:"-" json:"bolts"`
	Outgoing []*Point   `gorm:"-" json:"outgoing,omitempty"`
	Incoming []*Point   `gorm:"-" json:"incoming,omitempty"`
}

type pointWithConnections struct {
	ID              string `gorm:"primaryKey"`
	OutgoingPointID *string
	IncomingPointID *string
}

func (Point) TableName() string {
	return "point"
}

func appendPoint(points []*Point, point *Point) []*Point {
	for _, item := range points {
		if item.ID == point.ID {
			return points
		}
	}

	return append(points, point)
}

func appendParent(parents **[]Parent, parent Parent) {
	for _, item := range **parents {
		if item.ID == parent.ID {
			return
		}
	}

	newList := append(**parents, parent)
	*parents = &newList
}

func appendBolt(bolts **[]Bolt, bolt Bolt) {
	for _, item := range **bolts {
		if item.ID == bolt.ID {
			return
		}
	}

	newList := append(**bolts, bolt)
	*bolts = &newList
}

func initParents(pointID string, parentsMap *map[string]**[]Parent) **[]Parent {
	var parents **[]Parent
	if existingParents, ok := (*parentsMap)[pointID]; !ok {
		p1 := make([]Parent, 0)
		p2 := &p1
		parents = &p2
		(*parentsMap)[pointID] = parents
	} else {
		parents = existingParents
	}

	return parents
}

func initBolts(pointID string, boltsMap *map[string]**[]Bolt) **[]Bolt {
	var bolts **[]Bolt
	if existingBolts, ok := (*boltsMap)[pointID]; !ok {
		b1 := make([]Bolt, 0)
		b2 := &b1
		bolts = &b2
		(*boltsMap)[pointID] = bolts
	} else {
		bolts = existingBolts
	}

	return bolts
}

func getParents(db *gorm.DB, pointIDs []string) ([]Parent, error) {
	var parents []Parent = make([]Parent, 0)

	err := db.Raw(`
		SELECT parent.*, child.id AS child_id
		FROM (
				SELECT id, parent_id
				FROM resource
				WHERE id IN ?
			UNION
				SELECT id, foster_parent_id AS parent_id
				FROM foster_care
				WHERE id IN ?
		) AS child
		JOIN resource parent ON child.parent_id = parent.id`, pointIDs, pointIDs).Scan(&parents).Error

	return parents, err
}

func getBolts(db *gorm.DB, pointIDs []string) ([]Bolt, error) {
	var bolts []Bolt = make([]Bolt, 0)

	err := db.Raw(`
		SELECT bolt.*, resource.parent_id
		FROM resource
		JOIN bolt ON resource.id = bolt.id
		WHERE resource.parent_id IN ?`, pointIDs).Scan(&bolts).Error

	return bolts, err
}

func GetPoints(db *gorm.DB, resourceID string) ([]*Point, error) {
	var raw []pointWithConnections = make([]pointWithConnections, 0)
	var parentsMap map[string]**[]Parent = make(map[string]**[]Parent)
	var boltsMap map[string]**[]Bolt = make(map[string]**[]Bolt)
	var points []*Point = make([]*Point, 0)

	if err := db.Raw(`
		SELECT point.id, connection_outgoing.dst_point_id AS outgoing_point_id, connection_incoming.src_point_id AS incoming_point_id
		FROM (
				SELECT id
				FROM resource
				WHERE parent_id = ?
			UNION
				SELECT id
				FROM foster_care
				WHERE foster_parent_id = ?
		) AS resource
		LEFT JOIN point ON point.id = resource.id
		LEFT JOIN connection connection_outgoing ON point.id = connection_outgoing.src_point_id
		LEFT JOIN connection connection_incoming ON point.id = connection_incoming.dst_point_id`, resourceID, resourceID).
		Scan(&raw).Error; err != nil {
		return nil, err
	}

	for _, data := range raw {
		var point *Point

		for _, existingPoint := range points {
			if data.ID == existingPoint.ID {
				point = existingPoint
				break
			}
		}

		if point == nil {
			parents := initParents(data.ID, &parentsMap)
			bolts := initBolts(data.ID, &boltsMap)

			point = &Point{
				ID:       data.ID,
				Parents:  parents,
				Bolts:    bolts,
				Incoming: make([]*Point, 0),
				Outgoing: make([]*Point, 0),
			}

			points = append(points, point)
		}

		if data.IncomingPointID != nil {
			parents := initParents(*data.IncomingPointID, &parentsMap)
			bolts := initBolts(*data.IncomingPointID, &boltsMap)

			var adjacentPoint *Point = &Point{ID: *data.IncomingPointID, Parents: parents, Bolts: bolts}
			point.Incoming = appendPoint(point.Incoming, adjacentPoint)
		}

		if data.OutgoingPointID != nil {
			parents := initParents(*data.OutgoingPointID, &parentsMap)
			bolts := initBolts(*data.OutgoingPointID, &boltsMap)

			var adjacentPoint *Point = &Point{ID: *data.OutgoingPointID, Parents: parents, Bolts: bolts}
			point.Outgoing = appendPoint(point.Outgoing, adjacentPoint)
		}
	}

	var pointIDs []string = make([]string, len(parentsMap))
	index := 0
	for id := range parentsMap {
		pointIDs[index] = id
		index += 1
	}

	if parents, err := getParents(db, pointIDs); err == nil {
		for _, parent := range parents {
			if parentsList, ok := parentsMap[*parent.ChildId]; ok {
				appendParent(parentsList, parent)
			}
		}
	}

	if bolts, err := getBolts(db, pointIDs); err == nil {
		for _, bolt := range bolts {
			if boltsList, ok := boltsMap[bolt.ParentID]; ok {
				appendBolt(boltsList, bolt)
			}
		}
	}

	return points, nil
}

func CreatePoint(db *gorm.DB, point *Point, parentResourceID string) error {
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

		if parents, err := getParents(db, []string{point.ID}); err == nil {
			p1 := &parents
			point.Parents = &p1
		}

		if bolts, err := getBolts(db, []string{point.ID}); err == nil {
			b1 := &bolts
			point.Bolts = &b1
		}

		return nil
	}

	point.ID = uuid.Must(uuid.NewRandom()).String()
	b1 := make([]Bolt, 0)
	b2 := &b1
	point.Bolts = &b2

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

	if parents, err := getParents(db, []string{point.ID}); err == nil {
		p1 := &parents
		point.Parents = &p1
	}

	return err
}
