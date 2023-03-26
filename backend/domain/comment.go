package domain

import (
	"context"

	"github.com/google/uuid"
)

type Comment struct {
	ResourceBase
	Text string            `json:"text"`
	Tags map[string]string `json:"tags"`
}

func (Comment) TableName() string {
	return "comment"
}

type CommentUsecase interface {
	GetComments(ctx context.Context, resourceID uuid.UUID) ([]Comment, error)
	GetComment(ctx context.Context, commentID uuid.UUID) (Comment, error)
	CreateComment(ctx context.Context, comment Comment, parentResourceID uuid.UUID) (Comment, error)
	UpdateComment(ctx context.Context, commentID uuid.UUID, comment Comment) (Comment, error)
	DeleteComment(ctx context.Context, commentID uuid.UUID) error
}

type CommentRepository interface {
	Transactor

	GetComments(ctx context.Context, resourceID uuid.UUID) ([]Comment, error)
	GetComment(ctx context.Context, commentID uuid.UUID) (Comment, error)
	GetCommentWithLock(ctx context.Context, commentID uuid.UUID) (Comment, error)
	InsertComment(ctx context.Context, comment Comment) error
	SaveComment(ctx context.Context, comment Comment) error
}
