package authorizer

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type authorizer struct {
	store domain.Datastore
}

func New(store domain.Datastore) domain.Authorizer {
	return &authorizer{
		store: store,
	}
}

func (a *authorizer) HasPermission(ctx context.Context, user *domain.User, resourceID uuid.UUID, permission domain.PermissionType) error {
	var notAuthorized error = &domain.ErrNotAuthorized{
		ResourceID: resourceID,
		Permission: permission,
	}

	if resourceID.String() == domain.RootID {
		return notAuthorized
	}

	ancestors, err := a.store.GetAncestors(ctx, resourceID)
	if err != nil {
		return err
	}

	isDeleted := true
	for _, ancestor := range ancestors {
		if ancestor.ID == uuid.MustParse(domain.RootID) {
			isDeleted = false
		}
	}

	if isDeleted {
		return notAuthorized
	}

	if permission == domain.ReadPermission {
		return nil
	}

	roles := a.store.GetRoles(ctx, user.ID)

	if len(roles) == 0 {
		return notAuthorized
	}

	resourceIDs := make([]uuid.UUID, len(ancestors)+1)
	for idx, ancestor := range ancestors {
		resourceIDs[idx] = ancestor.ID
	}
	resourceIDs[len(ancestors)] = resourceID

	for _, id := range resourceIDs {
		for _, role := range roles {
			if role.ResourceID == id && (role.Role == domain.RoleAdmin || role.Role == domain.RoleOwner) {
				return nil
			}
		}
	}

	return notAuthorized
}
