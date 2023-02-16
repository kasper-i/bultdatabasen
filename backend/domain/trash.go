package domain

import "context"

type TrashRepository interface {
	Transactor

	InsertTrash(ctx context.Context, trash Trash) error
}
