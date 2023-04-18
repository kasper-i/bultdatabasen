package authorizer

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type authorizer struct {
	authRepo     domain.AuthRepository
	resourceRepo domain.ResourceRepository
}

func New(authRepo domain.AuthRepository, resourceRepo domain.ResourceRepository) domain.Authorizer {
	return &authorizer{
		authRepo:     authRepo,
		resourceRepo: resourceRepo,
	}
}

func (a *authorizer) HasPermission(ctx context.Context, user *domain.User, resourceID uuid.UUID, permission domain.PermissionType) error {
	var notAuthorized error = &domain.ErrNotAuthorized{
		ResourceID: resourceID,
		Permission: permission,
	}

	if resourceID.String() == domain.RootID && permission == domain.ReadPermission {
		return nil
	}

	ancestors, err := a.resourceRepo.GetAncestors(ctx, resourceID)
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

	roles, err := a.authRepo.GetUserRoles(ctx, user.ID)
	if err != nil {
		return err
	}

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
