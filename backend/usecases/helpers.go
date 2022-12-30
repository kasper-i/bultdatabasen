package usecases

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"context"
	"time"

	"github.com/google/uuid"
)

func createResource(ctx context.Context, store domain.Datastore, resource domain.Resource, parentResourceID uuid.UUID) (domain.Resource, error) {
	resource.ID = uuid.New()

	resource.BirthTime = time.Now()
	resource.ModifiedTime = time.Now()

	resource.CreatorID = ""
	resource.LastUpdatedByID = ""

	switch resource.Type {
	case domain.TypeRoot:
		return domain.Resource{}, utils.ErrNotPermitted
	case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
		resource.LeafOf = nil
	default:
		resource.LeafOf = &parentResourceID
	}

	if !checkParentAllowed(ctx, store, resource, parentResourceID) {
		return domain.Resource{}, utils.ErrHierarchyStructureViolation
	}

	err := store.Transaction(func(store domain.Datastore) error {
		if err := store.InsertResource(ctx, resource); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			return store.InsertTreePath(ctx, resource.ID, parentResourceID)
		}

		return nil
	})

	return resource, err
}

func deleteResource(ctx context.Context, store domain.Datastore, resourceID uuid.UUID) error {
	ancestors, err := store.GetAncestors(ctx, resourceID)
	if err != nil {
		return err
	}

	trash := domain.Trash{
		ResourceID:  resourceID,
		DeletedTime: time.Now(),
		DeletedByID: "",
	}

	err = store.Transaction(func(store domain.Datastore) error {
		err := store.GetSubtreeLock(ctx, resourceID)
		if err != nil {
			return err
		}

		resource, err := store.GetResourceWithLock(ctx, resourceID)
		if err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeRoot:
			return utils.ErrNotPermitted
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			subtree, err := store.GetTreePath(ctx, resourceID)
			if err != nil {
				return err
			}

			if err := store.MoveSubtree(ctx, subtree, make(domain.Path, 0)); err != nil {
				return err
			}

			trash.OrigPath = &subtree
		default:
			trash.OrigLeafOf = resource.LeafOf
			resource.LeafOf = nil

			if err := store.OrphanResource(ctx, resourceID); err != nil {
				return err
			}
		}

		countersDifference := domain.Counters{}.Substract(resource.Counters)

		for _, ancestor := range ancestors {
			if err := store.UpdateCounters(ctx, ancestor.ID, countersDifference); err != nil {
				return err
			}
		}

		return store.InsertTrash(ctx, trash)
	})

	if err != nil {
		return err
	}

	return nil
}

func checkParentAllowed(ctx context.Context, store domain.Datastore, resource domain.Resource, parentID uuid.UUID) bool {
	var parentResource domain.Resource
	var err error

	if parentResource, err = store.GetResource(ctx, parentID); err != nil {
		return false
	}

	pt := parentResource.Type

	switch resource.Type {
	case domain.TypeArea:
		return pt == domain.TypeRoot || pt == domain.TypeArea
	case domain.TypeCrag:
		return pt == domain.TypeArea
	case domain.TypeSector:
		return pt == domain.TypeCrag
	case domain.TypeRoute:
		return pt == domain.TypeArea || pt == domain.TypeCrag || pt == domain.TypeSector
	case domain.TypePoint:
		return pt == domain.TypeRoute
	case domain.TypeBolt:
		return pt == domain.TypePoint
	case domain.TypeImage:
		return pt == domain.TypePoint
	case domain.TypeComment:
		return pt == domain.TypePoint
	case domain.TypeTask:
		return pt == domain.TypeRoute || pt == domain.TypePoint
	default:
		return false
	}
}

func updateCountersForResourceAndAncestors(ctx context.Context, store domain.Datastore, resourceID uuid.UUID, delta domain.Counters) error {
	ancestors, err := store.GetAncestors(ctx, resourceID)
	if err != nil {
		return err
	}

	resourceIDs := append(utils.Map(ancestors, func(ancestor domain.Resource) uuid.UUID { return ancestor.ID }), resourceID)

	for _, resourceID := range resourceIDs {
		if err := store.UpdateCounters(ctx, resourceID, delta); err != nil {
			return err
		}
	}

	return nil
}
