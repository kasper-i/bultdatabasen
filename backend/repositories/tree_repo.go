package repositories

import (
	"bultdatabasen/domain"
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

func (store *psqlDatastore) GetTreePath(ctx context.Context, resourceID uuid.UUID) (domain.Path, error) {
	var out struct {
		Path domain.Path `gorm:"column:path"`
	}

	if err := store.tx(ctx).Raw(`SELECT path::text AS path
		FROM tree
		WHERE resource_id = ?`, resourceID).Scan(&out).Error; err != nil {
		return nil, err
	}

	return out.Path, nil
}

func (store *psqlDatastore) InsertTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error {
	return store.tx(ctx).Exec(`INSERT INTO tree (resource_id, path)
		SELECT @resourceID, path || REPLACE(@resourceID, '-', '_')
		FROM tree
		WHERE resource_id = @parentID`, sql.Named("parentID", parentID), sql.Named("resourceID", resourceID)).Error
}

func (store *psqlDatastore) RemoveTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error {
	return store.tx(ctx).Exec(`DELETE FROM tree
		WHERE path <@ (SELECT path FROM tree WHERE resource_id = @parentID LIMIT 1) AND resource_id = @resourceID`,
		sql.Named("parentID", parentID), sql.Named("resourceID", resourceID)).Error
}

func (store *psqlDatastore) MoveSubtree(ctx context.Context, subtree domain.Path, newAncestralPath domain.Path) error {
	return store.tx(ctx).Exec(`UPDATE tree
		SET path = ? || subpath(path, ?)
		WHERE path <@ ?`, newAncestralPath, len(subtree)-1, subtree).Error
}

func (store *psqlDatastore) GetSubtreeLock(ctx context.Context, resourceID uuid.UUID) error {
	if err := store.tx(ctx).Exec(fmt.Sprintf(`%s
		SELECT * FROM (
			SELECT resource_id
			FROM tree
			INNER JOIN resource ON tree.resource_id = resource.id
			FOR UPDATE) t1
		UNION ALL
		SELECT * FROM (
			SELECT resource_id
			FROM tree
			INNER JOIN resource leaf ON tree.resource_id = leaf.leaf_of
			FOR UPDATE) t2`, withTreeQuery()), resourceID).Error; err != nil {
		return err
	}

	return nil
}
