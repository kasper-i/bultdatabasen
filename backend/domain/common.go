package domain

import (
	"database/sql/driver"
	"strings"

	"github.com/google/uuid"
)

type Pagination struct {
	Page         int
	ItemsPerPage int
}

type Meta struct {
	TotalItems int64 `gorm:"column:total_items" json:"totalItems"`
}

func (pagination *Pagination) Valid() bool {
	return pagination.Page > 0 && pagination.ItemsPerPage <= 25
}

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
