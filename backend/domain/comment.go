package domain

import (
	"context"

	"github.com/google/uuid"
)

type Comment struct {
	ResourceBase
}

func (Comment) TableName() string {
	return "comment"
}

type CommentUsecase interface {
	GetComments(ctx context.Context, resourceID uuid.UUID) ([]Comment, error)
	GetComment(ctx context.Context, taskID uuid.UUID) (Comment, error)
	CreateComment(ctx context.Context, task Comment, parentResourceID uuid.UUID) (Comment, error)
	UpdateComment(ctx context.Context, taskID uuid.UUID, task Comment) (Comment, error)
	DeleteComment(ctx context.Context, taskID uuid.UUID) error
}

type CommentRepository interface {
	Transactor

	GetComments(ctx context.Context, resourceID uuid.UUID) ([]Comment, error)
	GetComment(ctx context.Context, taskID uuid.UUID) (Comment, error)
	GetCommentWithLock(ctx context.Context, taskID uuid.UUID) (Comment, error)
	InsertComment(ctx context.Context, task Comment) error
	SaveComment(ctx context.Context, task Comment) error
}
