package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetComments(ctx context.Context, resourceID uuid.UUID) ([]domain.Comment, error) {
	var comments []domain.Comment = make([]domain.Comment, 0)

	query := fmt.Sprintf(`%s SELECT *
		FROM tree
		INNER JOIN resource ON tree.resource_id = resource.leaf_of
		INNER JOIN comment ON resource.id = comment.id`, withTreeQuery())

	if err := store.tx(ctx).Raw(query, resourceID).Scan(&comments).Error; err != nil {
		return nil, err
	}

	return comments, nil
}

func (store *psqlDatastore) GetComment(ctx context.Context, resourceID uuid.UUID) (domain.Comment, error) {
	var comment domain.Comment

	if err := store.tx(ctx).Raw(`SELECT * FROM comment INNER JOIN resource ON comment.id = resource.id WHERE comment.id = ?`, resourceID).
		Scan(&comment).Error; err != nil {
		return domain.Comment{}, err
	}

	if comment.ID == uuid.Nil {
		return domain.Comment{}, gorm.ErrRecordNotFound
	}

	return comment, nil
}

func (store *psqlDatastore) GetCommentWithLock(ctx context.Context, resourceID uuid.UUID) (domain.Comment, error) {
	var comment domain.Comment

	if err := store.tx(ctx).Raw(`SELECT * FROM comment INNER JOIN resource ON comment.id = resource.id WHERE comment.id = ? FOR UPDATE`, resourceID).
		Scan(&comment).Error; err != nil {
		return domain.Comment{}, err
	}

	if comment.ID == uuid.Nil {
		return domain.Comment{}, gorm.ErrRecordNotFound
	}

	return comment, nil
}

func (store *psqlDatastore) InsertComment(ctx context.Context, comment domain.Comment) error {
	return store.tx(ctx).Create(&comment).Error
}

func (store *psqlDatastore) SaveComment(ctx context.Context, comment domain.Comment) error {
	return store.tx(ctx).Select(
		"Text",
		"Tags").Updates(comment).Error
}
