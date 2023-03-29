package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type commentUsecase struct {
	commentRepo   domain.CommentRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rh            domain.ResourceHelper
}

func NewCommentUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, commentRepo domain.CommentRepository, rh domain.ResourceHelper) domain.CommentUsecase {
	return &commentUsecase{
		commentRepo:   commentRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rh:            rh,
	}
}

func (uc *commentUsecase) GetComments(ctx context.Context, resourceID uuid.UUID) ([]domain.Comment, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.commentRepo.GetComments(ctx, resourceID)
}

func (uc *commentUsecase) GetComment(ctx context.Context, commentID uuid.UUID) (domain.Comment, error) {
	ancestors, err := uc.rh.GetAncestors(ctx, commentID)
	if err != nil {
		return domain.Comment{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, commentID, domain.ReadPermission); err != nil {
		return domain.Comment{}, err
	}

	comment, err := uc.commentRepo.GetComment(ctx, commentID)
	if err != nil {
		return domain.Comment{}, err
	}

	comment.Ancestors = ancestors
	return comment, nil
}

func (uc *commentUsecase) CreateComment(ctx context.Context, comment domain.Comment, parentResourceID uuid.UUID) (domain.Comment, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Comment{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Comment{}, err
	}

	resource := domain.Resource{
		ResourceBase: comment.ResourceBase,
		Type:         domain.TypeComment,
	}

	err = uc.commentRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rh.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			comment.ID = createdResource.ID
			comment.UserID = createdResource.CreatorID
			comment.BirthTime = createdResource.BirthTime
		}

		if err := uc.commentRepo.InsertComment(txCtx, comment); err != nil {
			return err
		}

		if comment.Ancestors, err = uc.rh.GetAncestors(txCtx, comment.ID); err != nil {
			return nil
		}

		return nil
	})

	if err != nil {
		return domain.Comment{}, err
	}

	return comment, err
}

func (uc *commentUsecase) DeleteComment(ctx context.Context, commentID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, commentID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.commentRepo.GetComment(ctx, commentID)
	if err != nil {
		return err
	}

	return uc.rh.DeleteResource(ctx, commentID, user.ID)
}

func (uc *commentUsecase) UpdateComment(ctx context.Context, commentID uuid.UUID, updatedComment domain.Comment) (domain.Comment, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Comment{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, commentID, domain.WritePermission); err != nil {
		return domain.Comment{}, err
	}

	err = uc.commentRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		original, err := uc.commentRepo.GetCommentWithLock(txCtx, commentID)
		if err != nil {
			return err
		}

		updatedComment.ID = original.ID

		if err := uc.rh.TouchResource(txCtx, commentID, user.ID); err != nil {
			return err
		}

		if err := uc.commentRepo.SaveComment(txCtx, updatedComment); err != nil {
			return err
		}

		if updatedComment.Ancestors, err = uc.rh.GetAncestors(txCtx, commentID); err != nil {
			return nil
		}

		return nil
	})

	return updatedComment, err
}