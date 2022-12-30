package usecases

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"context"

	"github.com/google/uuid"
)

type resourceUsecase struct {
	store domain.Datastore
}

func NewResourceUsecase(store domain.Datastore) domain.ResourceUsecase {
	return &resourceUsecase{
		store: store,
	}
}

type ResourcePatch struct {
	ParentID uuid.UUID `json:"parentId"`
}

func (uc *resourceUsecase) GetResource(ctx context.Context, resourceID uuid.UUID) (domain.Resource, error) {
	return uc.store.GetResource(ctx, resourceID)
}

func (uc *resourceUsecase) MoveResource(ctx context.Context, resourceID, newParentID uuid.UUID) error {
	var resource domain.Resource
	var subtree domain.Path
	var err error
	var oldParentID uuid.UUID

	return uc.store.Transaction(func(store domain.Datastore) error {
		if err := uc.store.GetSubtreeLock(ctx, resourceID); err != nil {
			return err
		}

		if resource, err = store.GetResourceWithLock(ctx, resourceID); err != nil {
			return err
		}

		switch resource.Type {
		case domain.TypeArea, domain.TypeCrag, domain.TypeSector, domain.TypeRoute:
			break
		default:
			return utils.ErrMoveNotPermitted
		}

		if subtree, err = store.GetTreePath(ctx, resourceID); err != nil {
			return err
		} else {
			oldParentID = subtree.Parent()
		}

		if oldParentID == newParentID {
			return utils.ErrHierarchyStructureViolation
		}

		if !checkParentAllowed(ctx, store, resource, newParentID) {
			return utils.ErrHierarchyStructureViolation
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, oldParentID, domain.Counters{}.Substract(resource.Counters)); err != nil {
			return err
		}

		var newParentPath domain.Path
		if newParentPath, err = store.GetTreePath(ctx, newParentID); err != nil {
			return err
		}

		if newParentPath.Root().String() != domain.RootID {
			return utils.ErrNotFound
		}

		if err := store.MoveSubtree(ctx, subtree, newParentPath); err != nil {
			return err
		}

		return updateCountersForResourceAndAncestors(ctx, store, newParentID, resource.Counters)
	})
}

func (uc *resourceUsecase) GetAncestors(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	return uc.store.GetAncestors(ctx, resourceID)
}

func (uc *resourceUsecase) GetChildren(ctx context.Context, resourceID uuid.UUID) ([]domain.Resource, error) {
	return uc.store.GetChildren(ctx, resourceID)
}

func (uc *resourceUsecase) Search(ctx context.Context, name string) ([]domain.ResourceWithParents, error) {
	return uc.store.Search(ctx, name)
}
