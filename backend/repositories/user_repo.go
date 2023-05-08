package repositories

import (
	"bultdatabasen/domain"
	"context"
	"database/sql"

	"github.com/google/uuid"
)

func (store *psqlDatastore) SaveUser(ctx context.Context, user domain.User) error {
	return store.tx(ctx).Save(user).Error
}

func (store *psqlDatastore) GetUsersByRole(ctx context.Context, resourceID uuid.UUID, role domain.RoleType) ([]domain.User, error) {
	users := make([]domain.User, 0)

	query := `WITH path AS (
		SELECT REPLACE(id, '_', '-')::uuid AS resource_id
		FROM tree, unnest(string_to_array(tree.path::text, '.')) AS id
		WHERE resource_id = @resourceID
	)
	SELECT ut.user_id AS id
		FROM path
		INNER JOIN team_role tr ON path.resource_id = tr.resource_id
		INNER JOIN user_team ut ON tr.team_id = ut.team_id
		WHERE tr.role = @role
	UNION
	SELECT ur.user_id AS id
		FROM path
		INNER JOIN user_role ur ON path.resource_id = ur.resource_id
		WHERE ur.role = @role`

	err := store.tx(ctx).Raw(query, sql.Named("resourceID", resourceID), sql.Named("role", role)).Scan(&users).Error

	return users, err
}
