package usecases

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type routeGraphVertex struct {
	PointID         uuid.UUID `gorm:"primaryKey"`
	OutgoingPointID uuid.UUID
	IncomingPointID uuid.UUID
}

func (sess Session) getParents(pointIDs []uuid.UUID) ([]domain.Parent, error) {
	var parents []domain.Parent = make([]domain.Parent, 0)

	err := sess.DB.Raw(`SELECT id, name, type, tree.resource_id as child_id
		FROM tree
		INNER JOIN resource parent ON REPLACE(subpath(tree.path, -2, 1)::text, '_', '-')::uuid = parent.id
		WHERE resource_id IN ?`, pointIDs).Scan(&parents).Error

	return parents, err
}

func (sess Session) getRouteGraph(routeID uuid.UUID) (map[uuid.UUID]*routeGraphVertex, error) {
	var connections []domain.PointConnection = make([]domain.PointConnection, 0)
	var graph map[uuid.UUID]*routeGraphVertex = make(map[uuid.UUID]*routeGraphVertex)

	err := sess.DB.Raw(`
		SELECT connection.*
		FROM connection
		WHERE route_id = ?`, routeID).Scan(&connections).Error

	if len(connections) == 0 {
		var points []*domain.Point = make([]*domain.Point, 0)

		if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
			INNER JOIN point ON tree.resource_id = point.id`,
			withTreeQuery()), routeID).Scan(&points).Error; err != nil {
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
				entry.OutgoingPointID = p
			}

			if entry, ok = graph[connection.DstPointID]; !ok {
				entry = &routeGraphVertex{PointID: connection.DstPointID}
				graph[connection.DstPointID] = entry
			}

			{
				p := connection.SrcPointID
				entry.IncomingPointID = p
			}
		}
	}

	return graph, err
}

func (sess Session) sortPoints(routeID uuid.UUID, pointsMap map[uuid.UUID]*domain.Point) ([]*domain.Point, error) {
	var routeGraph map[uuid.UUID]*routeGraphVertex
	var orderedPoints []*domain.Point = make([]*domain.Point, 0)
	var err error
	var startPointID uuid.UUID

	if routeGraph, err = sess.getRouteGraph(routeID); err != nil {
		return nil, err
	}

	for _, connection := range routeGraph {
		if connection.IncomingPointID == uuid.Nil {
			startPointID = connection.PointID
			break
		}
	}

	if startPointID == uuid.Nil {
		return nil, utils.ErrLoopDetected
	} else {
		currentPointID := startPointID
		index := 0

		for index < len(pointsMap) {
			vertex := routeGraph[currentPointID]

			if point, ok := pointsMap[currentPointID]; ok {
				point.Number = index + 1
				orderedPoints = append(orderedPoints, point)
				index += 1
			} else {
				return nil, utils.ErrCorruptResource
			}

			if vertex.OutgoingPointID == uuid.Nil {
				break
			} else {
				currentPointID = vertex.OutgoingPointID
			}
		}

		if index != len(pointsMap) {
			return nil, utils.ErrCorruptResource
		}
	}

	return orderedPoints, nil
}

func (sess Session) getPointWithLock(pointID uuid.UUID) (*domain.Point, error) {
	var point domain.Point

	if err := sess.DB.Raw(`SELECT * FROM point INNER JOIN resource ON point.id = resource.id WHERE point.id = ? FOR UPDATE`, pointID).
		Scan(&point).Error; err != nil {
		return nil, err
	}

	if point.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &point, nil
}

func (sess Session) GetPoints(ctx context.Context, resourceID uuid.UUID) ([]*domain.Point, error) {
	var pointsMap map[uuid.UUID]*domain.Point = make(map[uuid.UUID]*domain.Point)
	var points []*domain.Point = make([]*domain.Point, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s SELECT * FROM tree
		INNER JOIN point ON tree.resource_id = point.id
		INNER JOIN resource ON tree.resource_id = resource.id`,
		withTreeQuery()), resourceID).Scan(&points).Error; err != nil {
		return nil, err
	}

	for _, point := range points {
		point.Parents = make([]domain.Parent, 0)
		point.Number = 1
		pointsMap[point.ID] = point
	}

	var pointIDs []uuid.UUID = make([]uuid.UUID, len(points))
	index := 0
	for _, point := range points {
		pointIDs[index] = point.ID
		index += 1
	}

	if parents, err := sess.getParents(pointIDs); err == nil {
		for _, parent := range parents {
			if point, ok := pointsMap[parent.ChildID]; ok {
				point.Parents = append(point.Parents, parent)
			}
		}
	}

	if len(points) <= 1 {
		return points, nil
	}

	return sess.sortPoints(resourceID, pointsMap)
}

func (sess Session) AttachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID, position *domain.InsertPosition, anchor bool, bolts []domain.Bolt) (*domain.Point, error) {
	var err error
	var point *domain.Point = &domain.Point{}
	var pointResource *domain.Resource
	var routeGraph map[uuid.UUID]*routeGraphVertex

	if _, err := sess.getRouteWithLock(routeID); err != nil {
		return nil, err
	}

	if routeGraph, err = sess.getRouteGraph(routeID); err != nil {
		return nil, err
	}

	// Only the first point added to a route can be unattached
	if len(routeGraph) > 0 && position == nil {
		return nil, utils.ErrMissingAttachmentPoint
	}

	// Check that we are not creating a loop
	if pointID != uuid.Nil {
		if _, ok := routeGraph[pointID]; ok {
			return nil, utils.ErrLoopDetected
		}
	}

	// Check that the insert position is a valid point in the route
	if position != nil {
		if _, ok := routeGraph[position.PointID]; !ok {
			return nil, utils.ErrInvalidAttachmentPoint
		}
	}

	if pointID != uuid.Nil {
		var err error

		if pointResource, err = sess.GetResource(ctx, pointID); err != nil {
			return nil, err
		}

		if pointResource.Type != domain.TypePoint {
			return nil, utils.ErrHierarchyStructureViolation
		}
	}

	err = sess.Transaction(func(sess Session) error {
		if pointID != uuid.Nil {
			if details, err := sess.getPointWithLock(pointID); err != nil {
				return err
			} else {
				point = details
			}

			if err := sess.DB.Exec(`INSERT INTO tree (resource_id, path)
				SELECT @pointID, path || REPLACE(@pointID, '-', '_')
				FROM tree
				WHERE resource_id = @routeID`, sql.Named("routeID", routeID), sql.Named("pointID", pointID)).Error; err != nil {
				return err
			}

			if err := sess.UpdateCountersForResource(ctx, routeID, point.Counters); err != nil {
				return err
			}
		} else {
			point.Anchor = anchor

			resource := domain.Resource{
				ResourceBase: point.ResourceBase,
				Type:         domain.TypePoint,
			}

			if err := sess.CreateResource(ctx, &resource, routeID); err != nil {
				return err
			}

			point.ID = resource.ID

			if err := sess.DB.Create(&point).Error; err != nil {
				return err
			}

			for _, bolt := range bolts {
				if err := sess.CreateBolt(ctx, &bolt, point.ID); err != nil {
					return err
				}
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
					if nextPoint != uuid.Nil {
						if err := sess.DeleteConnection(ctx, routeID, insertionPoint, nextPoint); err != nil {
							return err
						}
						if err := sess.CreateConnection(ctx, routeID, newPoint, nextPoint); err != nil {
							return err
						}
					}
				case "before":
					if prevPoint != uuid.Nil {
						if err := sess.DeleteConnection(ctx, routeID, prevPoint, insertionPoint); err != nil {
							return err
						}
						if err := sess.CreateConnection(ctx, routeID, prevPoint, newPoint); err != nil {
							return err
						}
					}
				}
			}

			switch position.Order {
			case "after":
				if err := sess.CreateConnection(ctx, routeID, insertionPoint, newPoint); err != nil {
					return err
				}
			case "before":
				if err := sess.CreateConnection(ctx, routeID, newPoint, insertionPoint); err != nil {
					return err
				}
			}
		}

		if parents, err := sess.getParents([]uuid.UUID{point.ID}); err == nil {
			point.Parents = parents
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return point, nil
}

func (sess Session) DetachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID) error {
	return sess.Transaction(func(sess Session) error {
		var err error
		var routeGraph map[uuid.UUID]*routeGraphVertex
		var parents []domain.Parent

		if _, err := sess.getRouteWithLock(routeID); err != nil {
			return err
		}

		var point *domain.Point
		if point, err = sess.getPointWithLock(pointID); err != nil {
			return err
		}

		if routeGraph, err = sess.getRouteGraph(routeID); err != nil {
			return err
		}

		if parents, err = sess.getParents([]uuid.UUID{pointID}); err != nil {
			return err
		}

		var belongsToRoute bool = false

		for _, parent := range parents {
			if parent.ID == routeID {
				belongsToRoute = true
			}
		}

		if !belongsToRoute {
			return gorm.ErrRecordNotFound
		}

		vertex := routeGraph[pointID]

		if vertex != nil {

			nextPoint := vertex.OutgoingPointID
			prevPoint := vertex.IncomingPointID

			if prevPoint != uuid.Nil {
				if err := sess.DeleteConnection(ctx, routeID, prevPoint, pointID); err != nil {
					return err
				}
			}

			if nextPoint != uuid.Nil {
				if err := sess.DeleteConnection(ctx, routeID, pointID, nextPoint); err != nil {
					return err
				}
			}

			if prevPoint != uuid.Nil && nextPoint != uuid.Nil {
				if err := sess.CreateConnection(ctx, routeID, prevPoint, nextPoint); err != nil {
					return err
				}
			}
		}

		if len(parents) == 1 {
			return sess.DeleteResource(ctx, pointID)
		} else {
			if err := sess.DB.Exec(`DELETE FROM tree
				WHERE path <@ (SELECT path FROM tree WHERE resource_id = @routeID LIMIT 1) AND resource_id = @pointID`,
				sql.Named("routeID", routeID), sql.Named("pointID", pointID)).Error; err != nil {
				return err
			}

			countersDifference := domain.Counters{}.Substract(point.Counters)
			if err := sess.UpdateCountersForResource(ctx, routeID, countersDifference); err != nil {
				return err
			}
		}

		return nil
	})
}
