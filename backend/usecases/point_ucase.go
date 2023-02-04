package usecases

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type pointUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewPointUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore) domain.PointUsecase {
	return &pointUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
	}
}

type routeGraphVertex struct {
	PointID         uuid.UUID `gorm:"primaryKey"`
	OutgoingPointID uuid.UUID
	IncomingPointID uuid.UUID
}

func (uc *pointUsecase) getRouteGraph(ctx context.Context, routeID uuid.UUID) (map[uuid.UUID]*routeGraphVertex, error) {
	var graph map[uuid.UUID]*routeGraphVertex = make(map[uuid.UUID]*routeGraphVertex)

	connections, err := uc.repo.GetPointConnections(ctx, routeID)
	if err != nil {
		return nil, err
	}

	if len(connections) == 0 {
		var points []domain.Point

		if points, err = uc.repo.GetPoints(ctx, routeID); err != nil {
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

func (uc *pointUsecase) sortPoints(ctx context.Context, routeID uuid.UUID, pointsMap map[uuid.UUID]*domain.Point) ([]domain.Point, error) {
	var routeGraph map[uuid.UUID]*routeGraphVertex
	var orderedPoints []domain.Point = make([]domain.Point, 0)
	var err error
	var startPointID uuid.UUID

	if routeGraph, err = uc.getRouteGraph(ctx, routeID); err != nil {
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
				orderedPoints = append(orderedPoints, *point)
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

func (uc *pointUsecase) GetPoints(ctx context.Context, resourceID uuid.UUID) ([]domain.Point, error) {
	var pointsMap map[uuid.UUID]*domain.Point = make(map[uuid.UUID]*domain.Point)
	var points []domain.Point
	var err error

	if points, err = uc.repo.GetPoints(ctx, resourceID); err != nil {
		return nil, err
	}

	for _, point := range points {
		point.Parents = make([]domain.Parent, 0)
		point.Number = 1
		pointsMap[point.ID] = &point
	}

	var pointIDs []uuid.UUID = make([]uuid.UUID, len(points))
	index := 0
	for _, point := range points {
		pointIDs[index] = point.ID
		index += 1
	}

	if parents, err := uc.repo.GetParents(ctx, pointIDs); err == nil {
		for _, parent := range parents {
			if point, ok := pointsMap[parent.ChildID]; ok {
				point.Parents = append(point.Parents, parent)
			}
		}
	}

	if len(points) <= 1 {
		return points, nil
	}

	return uc.sortPoints(ctx, resourceID, pointsMap)
}

func (uc *pointUsecase) AttachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID, position *domain.InsertPosition, anchor bool, bolts []domain.Bolt) (domain.Point, error) {
	var err error
	var point domain.Point = domain.Point{}
	var pointResource domain.Resource
	var routeGraph map[uuid.UUID]*routeGraphVertex

	if _, err := uc.repo.GetRouteWithLock(routeID); err != nil {
		return domain.Point{}, err
	}

	if routeGraph, err = uc.getRouteGraph(ctx, routeID); err != nil {
		return domain.Point{}, err
	}

	// Only the first point added to a route can be unattached
	if len(routeGraph) > 0 && position == nil {
		return domain.Point{}, utils.ErrMissingAttachmentPoint
	}

	// Check that we are not creating a loop
	if pointID != uuid.Nil {
		if _, ok := routeGraph[pointID]; ok {
			return domain.Point{}, utils.ErrLoopDetected
		}
	}

	// Check that the insert position is a valid point in the route
	if position != nil {
		if _, ok := routeGraph[position.PointID]; !ok {
			return domain.Point{}, utils.ErrInvalidAttachmentPoint
		}
	}

	if pointID != uuid.Nil {
		var err error

		if pointResource, err = uc.repo.GetResource(ctx, pointID); err != nil {
			return domain.Point{}, err
		}

		if pointResource.Type != domain.TypePoint {
			return domain.Point{}, utils.ErrHierarchyStructureViolation
		}
	}

	err = uc.repo.Transaction(func(store domain.Datastore) error {
		if pointID != uuid.Nil {
			if details, err := store.GetPointWithLock(ctx, pointID); err != nil {
				return err
			} else {
				point = details
			}

			if err := uc.repo.InsertTreePath(ctx, pointID, routeID); err != nil {
				return err
			}

			if err := store.UpdateCounters(ctx, routeID, point.Counters); err != nil {
				return err
			}
		} else {
			point.Anchor = anchor

			resource := domain.Resource{
				ResourceBase: point.ResourceBase,
				Type:         domain.TypePoint,
			}

			if createdResource, err := createResource(ctx, store, resource, routeID); err != nil {
				return err
			} else {
				point.ID = createdResource.ID
			}

			if err := store.InsertPoint(ctx, point); err != nil {
				return err
			}

			//for _, bolt := range bolts {
			//	if err := sess.CreateBolt(ctx, &bolt, point.ID); err != nil {
			//		return err
			//	}
			//}
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
						if err := store.DeletePointConnection(ctx, routeID, insertionPoint, nextPoint); err != nil {
							return err
						}
						if err := store.CreatePointConnection(ctx, routeID, newPoint, nextPoint); err != nil {
							return err
						}
					}
				case "before":
					if prevPoint != uuid.Nil {
						if err := store.DeletePointConnection(ctx, routeID, prevPoint, insertionPoint); err != nil {
							return err
						}
						if err := store.CreatePointConnection(ctx, routeID, prevPoint, newPoint); err != nil {
							return err
						}
					}
				}
			}

			switch position.Order {
			case "after":
				if err := store.CreatePointConnection(ctx, routeID, insertionPoint, newPoint); err != nil {
					return err
				}
			case "before":
				if err := store.CreatePointConnection(ctx, routeID, newPoint, insertionPoint); err != nil {
					return err
				}
			}
		}

		if parents, err := store.GetParents(ctx, []uuid.UUID{point.ID}); err == nil {
			point.Parents = parents
		}

		if ancestors, err := uc.repo.GetAncestors(ctx, point.ID); err != nil {
			return nil
		} else {
			point.Ancestors = ancestors
		}

		return nil
	})

	if err != nil {
		return domain.Point{}, err
	}

	return point, nil
}

func (uc *pointUsecase) DetachPoint(ctx context.Context, routeID uuid.UUID, pointID uuid.UUID) error {
	return uc.repo.Transaction(func(store domain.Datastore) error {
		var err error
		var routeGraph map[uuid.UUID]*routeGraphVertex
		var parents []domain.Parent

		if _, err := store.GetRouteWithLock(routeID); err != nil {
			return err
		}

		var point domain.Point
		if point, err = store.GetPointWithLock(ctx, pointID); err != nil {
			return err
		}

		if routeGraph, err = uc.getRouteGraph(ctx, routeID); err != nil {
			return err
		}

		if parents, err = store.GetParents(ctx, []uuid.UUID{pointID}); err != nil {
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
				if err := store.DeletePointConnection(ctx, routeID, prevPoint, pointID); err != nil {
					return err
				}
			}

			if nextPoint != uuid.Nil {
				if err := store.DeletePointConnection(ctx, routeID, pointID, nextPoint); err != nil {
					return err
				}
			}

			if prevPoint != uuid.Nil && nextPoint != uuid.Nil {
				if err := store.CreatePointConnection(ctx, routeID, prevPoint, nextPoint); err != nil {
					return err
				}
			}
		}

		if len(parents) == 1 {
			return deleteResource(ctx, store, pointID)
		} else {
			if err := store.RemoveTreePath(ctx, pointID, routeID); err != nil {
				return err
			}

			countersDifference := domain.Counters{}.Substract(point.Counters)
			if err := store.UpdateCounters(ctx, routeID, countersDifference); err != nil {
				return err
			}
		}

		return nil
	})
}
