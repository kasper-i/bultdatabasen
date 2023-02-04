package core

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"context"
	"time"

	"github.com/google/uuid"
)

type rm struct {
	repo domain.Datastore
}

func NewResourceManager() domain.ResourceManager {
	return &rm{
		repo: nil,
	}
}

func (rm *rm) CreateResource(ctx context.Context, resource domain.Resource, parentResourceID uuid.UUID, userID string) (domain.Resource, error) {
	resource.ID = uuid.New()

	resource.BirthTime = time.Now()
	resource.ModifiedTime = time.Now()

	resource.CreatorID = userID
	resource.LastUpdatedByID = userID

	switch resource.Type {
	case domain.TypeRoot:
		return domain.Resource{}, utils.ErrNotPermitted
	case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
		resource.LeafOf = nil
	default:
		resource.LeafOf = &parentResourceID
	}

	if !rm.checkParentAllowed(ctx, resource, parentResourceID) {
		return domain.Resource{}, utils.ErrHierarchyStructureViolation
	}

	err := rm.repo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if err := rm.repo.InsertResource(ctx, resource); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			return rm.repo.InsertTreePath(txCtx, resource.ID, parentResourceID)
		}

		return nil
	})

	return resource, err
}

func (rm *rm) DeleteResource(ctx context.Context, resourceID uuid.UUID, userID string) error {
	ancestors, err := rm.repo.GetAncestors(ctx, resourceID)
	if err != nil {
		return err
	}

	trash := domain.Trash{
		ResourceID:  resourceID,
		DeletedTime: time.Now(),
		DeletedByID: "",
	}

	err = rm.repo.WithinTransaction(ctx, func(txCtx context.Context) error {
		err := rm.repo.GetSubtreeLock(txCtx, resourceID)
		if err != nil {
			return err
		}

		resource, err := rm.repo.GetResourceWithLock(txCtx, resourceID)
		if err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeRoot:
			return utils.ErrNotPermitted
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			subtree, err := rm.repo.GetTreePath(txCtx, resourceID)
			if err != nil {
				return err
			}

			if err := rm.repo.MoveSubtree(txCtx, subtree, make(domain.Path, 0)); err != nil {
				return err
			}

			trash.OrigPath = &subtree
		default:
			trash.OrigLeafOf = resource.LeafOf
			resource.LeafOf = nil

			if err := rm.repo.OrphanResource(txCtx, resourceID); err != nil {
				return err
			}
		}

		countersDifference := domain.Counters{}.Substract(resource.Counters)

		for _, ancestor := range ancestors {
			if err := rm.repo.UpdateCounters(txCtx, ancestor.ID, countersDifference); err != nil {
				return err
			}
		}

		return rm.repo.InsertTrash(txCtx, trash)
	})

	if err != nil {
		return err
	}

	return nil
}

func (rm *rm) MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error {
	var resource domain.Resource
	var subtree domain.Path
	var err error
	var oldParentID uuid.UUID

	return rm.repo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if err := rm.repo.GetSubtreeLock(txCtx, resourceID); err != nil {
			return err
		}

		if resource, err = rm.repo.GetResourceWithLock(txCtx, resourceID); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute:
			break
		default:
			return utils.ErrMoveNotPermitted
		}

		if subtree, err = rm.repo.GetTreePath(txCtx, resourceID); err != nil {
			return err
		} else {
			oldParentID = subtree.Parent()
		}

		if oldParentID == newParentID {
			return utils.ErrHierarchyStructureViolation
		}

		if !rm.checkParentAllowed(txCtx, resource, newParentID) {
			return utils.ErrHierarchyStructureViolation
		}

		oldParentAncestorIDs := 0
		if err := rm.UpdateCounters(txCtx, domain.Counters{}.Substract(resource.Counters), append(oldParentAncestorIDs, oldParentID)); err != nil {
			return err
		}

		var newParentPath domain.Path
		if newParentPath, err = rm.repo.GetTreePath(txCtx, newParentID); err != nil {
			return err
		}

		if newParentPath.Root().String() != domain.RootID {
			return utils.ErrNotFound
		}

		if err := rm.repo.MoveSubtree(txCtx, subtree, newParentPath); err != nil {
			return err
		}

		newParentAncestorsIDs = 0
		return rm.UpdateCounters(txCtx, resource.Counters, append(newParentAncetorIDs, newParentID)...)
	})
}

func (rm *rm) UpdateCounters(ctx context.Context, delta domain.Counters, resourceIDs ...uuid.UUID) error {
	difference := delta.AsMap()

	if len(difference) == 0 {
		return nil
	}

	for _, resourceID := range resourceIDs {
		if err := rm.repo.UpdateCounters(ctx, resourceID, delta); err != nil {
			return err
		}
	}

	return nil
}

func (rm *rm) checkParentAllowed(ctx context.Context, resource domain.Resource, parentID uuid.UUID) bool {
	var parentResource domain.Resource
	var err error

	if parentResource, err = rm.repo.GetResource(ctx, parentID); err != nil {
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
