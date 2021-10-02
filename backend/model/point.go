package model

import (
	"bultdatabasen/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Point struct {
	ID      string   `gorm:"primaryKey" json:"id"`
	Parents []Parent `gorm:"-" json:"parents"`
}

type InsertPosition struct {
	PointID string `json:"pointId"`
	Order   string `json:"order"`
}

type routeGraphVertex struct {
	PointID         string `gorm:"primaryKey"`
	OutgoingPointID *string
	IncomingPointID *string
}

func (Point) TableName() string {
	return "point"
}

func getParents(db *gorm.DB, pointIDs []string) ([]Parent, error) {
	var parents []Parent = make([]Parent, 0)

	err := db.Raw(`
		SELECT parent.*, child.id AS child_id, child.foster_care as foster_parent
		FROM (
				SELECT id, parent_id, FALSE as foster_care
				FROM resource
				WHERE id IN ?
			UNION
				SELECT id, foster_parent_id AS parent_id, TRUE as foster_care
				FROM foster_care
				WHERE id IN ?
		) AS child
		INNER JOIN resource parent ON child.parent_id = parent.id`, pointIDs, pointIDs).Scan(&parents).Error

	return parents, err
}

func getRouteGraph(db *gorm.DB, routeID string) (map[string]*routeGraphVertex, error) {
	var connections []Connection = make([]Connection, 0)
	var graph map[string]*routeGraphVertex = make(map[string]*routeGraphVertex)

	err := db.Raw(`
		SELECT connection.*
		FROM connection
		WHERE route_id = ?`, routeID).Scan(&connections).Error

	if len(connections) == 0 {
		var points []*Point = make([]*Point, 0)

		if err := db.Raw(getDescendantsQuery("point"), routeID).Scan(&points).Error; err != nil {
			return nil, err
		}

		if len(points) > 1 {
			return graph, utils.ErrCorruptResource
		}

		if len(points) == 1 {
			graph[points[0].ID] = &routeGraphVertex{PointID: points[0].ID}
		}

		return graph, err
	} else {
		for _, connection := range connections {
			var ok bool
			var entry *routeGraphVertex

			if entry, ok = graph[connection.SrcPointID]; !ok {
				entry = &routeGraphVertex{PointID: connection.SrcPointID}
				graph[connection.SrcPointID] = entry
			}

			{
				p := connection.DstPointID
				entry.OutgoingPointID = &p
			}

			if entry, ok = graph[connection.DstPointID]; !ok {
				entry = &routeGraphVertex{PointID: connection.DstPointID}
				graph[connection.DstPointID] = entry
			}

			{
				p := connection.SrcPointID
				entry.IncomingPointID = &p
			}
		}
	}

	return graph, err
}

func sortPoints(db *gorm.DB, routeID string, pointsMap map[string]*Point) ([]*Point, error) {
	var routeGraph map[string]*routeGraphVertex
	var orderedPoints []*Point = make([]*Point, 0)
	var err error
	var startPointID string

	if routeGraph, err = getRouteGraph(db, routeID); err != nil {
		return nil, err
	}

	for _, connection := range routeGraph {
		if connection.IncomingPointID == nil {
			startPointID = connection.PointID
			break
		}
	}

	if startPointID == "" {
		return nil, utils.ErrLoopDetected
	} else {
		currentPointID := startPointID
		index := 0

		for index < len(pointsMap) {
			vertex := routeGraph[currentPointID]

			if point, ok := pointsMap[currentPointID]; ok {
				orderedPoints = append(orderedPoints, point)
				index += 1
			} else {
				return nil, utils.ErrCorruptResource
			}

			if vertex.OutgoingPointID == nil {
				break
			} else {
				currentPointID = *vertex.OutgoingPointID
			}
		}

		if index != len(pointsMap) {
			return nil, utils.ErrCorruptResource
		}
	}

	return orderedPoints, nil
}

func GetPoints(db *gorm.DB, resourceID string) ([]*Point, error) {
	var pointsMap map[string]*Point = make(map[string]*Point)
	var points []*Point = make([]*Point, 0)

	if err := db.Raw(getDescendantsQuery("point"), resourceID).Scan(&points).Error; err != nil {
		return nil, err
	}

	for _, point := range points {
		point.Parents = make([]Parent, 0)
		pointsMap[point.ID] = point
	}

	var pointIDs []string = make([]string, len(points))
	index := 0
	for _, point := range points {
		pointIDs[index] = point.ID
		index += 1
	}

	if parents, err := getParents(db, pointIDs); err == nil {
		for _, parent := range parents {
			if point, ok := pointsMap[*parent.ChildID]; ok {
				point.Parents = append(point.Parents, parent)
			}
		}
	}

	if len(points) <= 1 {
		return points, nil
	}

	return sortPoints(db, resourceID, pointsMap)
}

func AttachPoint(db *gorm.DB, routeID string, pointID *string, position *InsertPosition) (*Point, error) {
	var err error
	var point *Point = &Point{}
	var pointResource *Resource
	var routeGraph map[string]*routeGraphVertex

	if routeGraph, err = getRouteGraph(db, routeID); err != nil {
		return nil, err
	}

	// Only the first point added to a route can be unattached
	if len(routeGraph) > 0 && position == nil {
		return nil, utils.ErrMissingAttachmentPoint
	}

	// Check that we are not creating a loop
	if pointID != nil {
		if _, ok := routeGraph[*pointID]; ok {
			return nil, utils.ErrLoopDetected
		}
	}

	// Check that the insert position is a valid point in the route
	if position != nil {
		if _, ok := routeGraph[position.PointID]; !ok {
			return nil, utils.ErrInvalidAttachmentPoint
		}
	}

	if pointID != nil {
		var err error

		if pointResource, err = GetResource(db, *pointID); err != nil {
			return nil, err
		}

		if pointResource.Type != "point" {
			return nil, utils.ErrHierarchyStructureViolation
		}
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if pointID != nil {
			point.ID = *pointID

			if err := addFosterParent(tx, *pointResource, routeID); err != nil {
				return err
			}
		} else {
			point.ID = uuid.Must(uuid.NewRandom()).String()

			resource := Resource{
				ID:       point.ID,
				Name:     nil,
				Type:     "point",
				ParentID: &routeID,
			}

			if err := createResource(tx, resource); err != nil {
				return err
			}

			if err := tx.Create(&point).Error; err != nil {
				return err
			}
		}

		if position != nil {
			newPoint := point.ID
			insertionPoint := position.PointID

			vertex := routeGraph[position.PointID]

			if vertex != nil {
				nextPoint := vertex.OutgoingPointID
				prevPoint := vertex.IncomingPointID

				switch position.Order {
				case "after":
					if nextPoint != nil {
						if err := DeleteConnection(tx, routeID, insertionPoint, *nextPoint); err != nil {
							return err
						}
						if err := CreateConnection(tx, routeID, newPoint, *nextPoint); err != nil {
							return err
						}
					}
				case "before":
					if prevPoint != nil {
						if err := DeleteConnection(tx, routeID, *prevPoint, insertionPoint); err != nil {
							return err
						}
						if err := CreateConnection(tx, routeID, *prevPoint, newPoint); err != nil {
							return err
						}
					}
				}
			}

			switch position.Order {
			case "after":
				if err := CreateConnection(tx, routeID, insertionPoint, newPoint); err != nil {
					return err
				}
			case "before":
				if err := CreateConnection(tx, routeID, newPoint, insertionPoint); err != nil {
					return err
				}
			}
		}

		if parents, err := getParents(tx, []string{point.ID}); err == nil {
			point.Parents = parents
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return point, nil
}

func DetachPoint(db *gorm.DB, routeID string, pointID string) error {
	var err error
	var routeGraph map[string]*routeGraphVertex
	var parents []Parent

	if routeGraph, err = getRouteGraph(db, routeID); err != nil {
		return err
	}

	if parents, err = getParents(db, []string{pointID}); err != nil {
		return err
	}

	var belongsToRoute bool = false
	var inFosterCare bool = false

	for _, parent := range parents {
		if parent.ID == routeID {
			belongsToRoute = true

			if parent.FosterParent {
				inFosterCare = true
			}
		}
	}

	if !belongsToRoute {
		return gorm.ErrRecordNotFound
	}

	vertex, _ := routeGraph[pointID]

	return db.Transaction(func(tx *gorm.DB) error {
		if vertex != nil {

			nextPoint := vertex.OutgoingPointID
			prevPoint := vertex.IncomingPointID

			if prevPoint != nil {
				if err := DeleteConnection(tx, routeID, *prevPoint, pointID); err != nil {
					return err
				}
			}

			if nextPoint != nil {
				if err := DeleteConnection(tx, routeID, pointID, *nextPoint); err != nil {
					return err
				}
			}

			if prevPoint != nil && nextPoint != nil {
				if err := CreateConnection(tx, routeID, *prevPoint, *nextPoint); err != nil {
					return err
				}
			}
		}

		if len(parents) == 1 {
			if err := tx.Delete(&Point{ID: pointID}).Error; err != nil {
				return err
			}

			if err := tx.Delete(&Resource{ID: pointID}).Error; err != nil {
				return err
			}
		} else if inFosterCare {
			if err := leaveFosterCare(tx, pointID, routeID); err != nil {
				return err
			}
		} else {
			var newOwnerID string

			// Any of the current foster parents becomes the new real parent
			for _, parent := range parents {
				if parent.ID != routeID {
					newOwnerID = parent.ID
				}
			}

			if err := leaveFosterCare(tx, pointID, newOwnerID); err != nil {
				return err
			}

			if err := moveResource(tx, Resource{ID: pointID, Type: "point"}, newOwnerID); err != nil {
				return err
			}
		}

		return nil
	})
}
