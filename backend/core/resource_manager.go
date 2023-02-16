package core

import (
	"bultdatabasen/domain"
	"context"
	"time"

	"github.com/google/uuid"
)

type rm struct {
	resourceRepo domain.ResourceRepository
	treeRepo     domain.TreeRepository
	trashRepo    domain.TrashRepository
}

func NewResourceManager(resourceRepo domain.ResourceRepository, treeRepo domain.TreeRepository, trashRepo domain.TrashRepository) domain.ResourceManager {
	return &rm{
		resourceRepo: resourceRepo,
		treeRepo:     treeRepo,
		trashRepo:    trashRepo,
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
		return domain.Resource{}, domain.ErrOperationRefused
	case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
		resource.LeafOf = nil
	default:
		resource.LeafOf = &parentResourceID
	}

	if !rm.checkParentAllowed(ctx, resource, parentResourceID) {
		return domain.Resource{}, domain.ErrIllegalParent
	}

	err := rm.resourceRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if err := rm.resourceRepo.InsertResource(ctx, resource); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			return rm.treeRepo.InsertTreePath(txCtx, resource.ID, parentResourceID)
		}

		return nil
	})

	return resource, err
}

func (rm *rm) DeleteResource(ctx context.Context, resourceID uuid.UUID, userID string) error {
	ancestors, err := rm.resourceRepo.GetAncestors(ctx, resourceID)
	if err != nil {
		return err
	}

	trash := domain.Trash{
		ResourceID:  resourceID,
		DeletedTime: time.Now(),
		DeletedByID: userID,
	}

	err = rm.resourceRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		err := rm.treeRepo.GetSubtreeLock(txCtx, resourceID)
		if err != nil {
			return err
		}

		resource, err := rm.resourceRepo.GetResourceWithLock(txCtx, resourceID)
		if err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeRoot:
			return domain.ErrOperationRefused
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute, domain.TypePoint:
			subtree, err := rm.treeRepo.GetTreePath(txCtx, resourceID)
			if err != nil {
				return err
			}

			if err := rm.treeRepo.MoveSubtree(txCtx, subtree, make(domain.Path, 0)); err != nil {
				return err
			}

			trash.OrigPath = &subtree
		default:
			trash.OrigLeafOf = resource.LeafOf
			resource.LeafOf = nil

			if err := rm.resourceRepo.OrphanResource(txCtx, resourceID); err != nil {
				return err
			}
		}

		countersDifference := domain.Counters{}.Substract(resource.Counters)

		for _, ancestor := range ancestors {
			if err := rm.resourceRepo.UpdateCounters(txCtx, ancestor.ID, countersDifference); err != nil {
				return err
			}
		}

		return rm.trashRepo.InsertTrash(txCtx, trash)
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

	return rm.resourceRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if err := rm.treeRepo.GetSubtreeLock(txCtx, resourceID); err != nil {
			return err
		}

		if resource, err = rm.resourceRepo.GetResourceWithLock(txCtx, resourceID); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute:
			break
		default:
			return domain.ErrUnmovableResource
		}

		if subtree, err = rm.treeRepo.GetTreePath(txCtx, resourceID); err != nil {
			return err
		} else {
			oldParentID = subtree.Parent()
		}

		if oldParentID == newParentID {
			return nil
		}

		if !rm.checkParentAllowed(txCtx, resource, newParentID) {
			return domain.ErrIllegalParent
		}

		if err := rm.UpdateCounters(txCtx, domain.Counters{}.Substract(resource.Counters), subtree[0:len(subtree)-1]...); err != nil {
			return err
		}

		var newParentPath domain.Path
		if newParentPath, err = rm.treeRepo.GetTreePath(txCtx, newParentID); err != nil {
			return err
		}

		if newParentPath.Root().String() != domain.RootID {
			return &domain.ErrNotAuthorized{
				ResourceID: newParentID,
				Permission: domain.ReadPermission,
			}
		}

		if err := rm.treeRepo.MoveSubtree(txCtx, subtree, newParentPath); err != nil {
			return err
		}

		return rm.UpdateCounters(txCtx, resource.Counters, newParentPath...)
	})
}

func (rm *rm) UpdateCounters(ctx context.Context, delta domain.Counters, resourceIDs ...uuid.UUID) error {
	difference := delta.AsMap()

	if len(difference) == 0 {
		return nil
	}

	for _, resourceID := range resourceIDs {
		if err := rm.resourceRepo.UpdateCounters(ctx, resourceID, delta); err != nil {
			return err
		}
	}

	return nil
}

func (rm *rm) checkParentAllowed(ctx context.Context, resource domain.Resource, parentID uuid.UUID) bool {
	var parentResource domain.Resource
	var err error

	if parentResource, err = rm.resourceRepo.GetResource(ctx, parentID); err != nil {
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

func (rm *rm) GetAncestors(ctx context.Context, resourceID uuid.UUID) (domain.Ancestors, error) {
	return rm.resourceRepo.GetAncestors(ctx, resourceID)
}

func (rm *rm) TouchResource(ctx context.Context, resourceID uuid.UUID, userID string) error {
	return rm.resourceRepo.TouchResource(ctx, resourceID, userID)
}

func (rm *rm) RenameResource(ctx context.Context, resourceID uuid.UUID, name, userID string) error {
	return rm.resourceRepo.RenameResource(ctx, resourceID, name, userID)
}
