package domain

import (
	"context"
	"database/sql/driver"
	"encoding/json"

	"github.com/google/uuid"
)

type Comment struct {
	ResourceBase
	Text string `json:"text"`
	Tags Tags  `json:"tags"`
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

type Tags []uuid.UUID

func (tags *Tags) Scan(value interface{}) error {
	bytes := value.([]byte)
	err := json.Unmarshal(bytes, tags)
	return err
}

func (tags Tags) Value() (driver.Value, error) {
	return json.Marshal(tags)
}
