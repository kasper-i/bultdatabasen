package domain

import (
	"context"
	"database/sql/driver"
	"strings"

	"github.com/google/uuid"
)

type Path []uuid.UUID

func (path Path) Value() (driver.Value, error) {
	parts := make([]string, len(path))

	for idx, resourceID := range path {
		parts[idx] = strings.ReplaceAll(resourceID.String(), "-", "_")
	}

	return strings.Join(parts, "."), nil
}

func (out *Path) Scan(value interface{}) error {
	s := strings.Split(value.(string), ".")
	path := make([]uuid.UUID, len(s))

	for idx, lvl := range s {
		if val, err := uuid.Parse(strings.ReplaceAll(lvl, "_", "-")); err != nil {
			return err
		} else {
			path[idx] = val
		}
	}

	*out = path
	return nil
}

func (self Path) Parent() uuid.UUID {
	return self[len(self)-2]
}

func (self Path) Root() uuid.UUID {
	return self[0]
}

func (self Path) Add(id uuid.UUID) Path {
	return append(self, id)
}

type TreeRepository interface {
	Transactor

	GetTreePath(ctx context.Context, resourceID uuid.UUID) (Path, error)
	InsertTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error
	RemoveTreePath(ctx context.Context, resourceID, parentID uuid.UUID) error
	MoveSubtree(ctx context.Context, subtree Path, newAncestralPath Path) error
	GetSubtreeLock(ctx context.Context, resourceID uuid.UUID) error
}
