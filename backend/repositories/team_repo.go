package repositories

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

func (store *psqlDatastore) GetTeamsByRole(ctx context.Context, resourceID uuid.UUID, role domain.RoleType) ([]domain.Team, error) {
	teams := make([]domain.Team, 0)

	query := `WITH path AS (
		SELECT REPLACE(id, '_', '-')::uuid AS resource_id
		FROM tree, unnest(string_to_array(tree.path::text, '.')) AS id
		WHERE resource_id = ?
	)
	SELECT team.id, team.name
		FROM path
		JOIN team_role tr ON path.resource_id = tr.resource_id
		JOIN team ON tr.team_id = team.id
		WHERE tr.role = ?
		GROUP BY team.id`

	err := store.tx(ctx).Raw(query, resourceID, role).Scan(&teams).Error

	return teams, err
}
