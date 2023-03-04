package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type taskUsecase struct {
	taskRepo      domain.TaskRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rh            domain.ResourceHelper
}

func NewTaskUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, taskRepo domain.TaskRepository, rh domain.ResourceHelper) domain.TaskUsecase {
	return &taskUsecase{
		taskRepo:      taskRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rh:            rh,
	}
}

func (uc *taskUsecase) GetTasks(ctx context.Context, resourceID uuid.UUID, pagination domain.Pagination, statuses []string) ([]domain.Task, domain.Meta, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, domain.Meta{}, err
	}

	return uc.taskRepo.GetTasks(ctx, resourceID, pagination, statuses)
}

func (uc *taskUsecase) GetTask(ctx context.Context, taskID uuid.UUID) (domain.Task, error) {
	ancestors, err := uc.rh.GetAncestors(ctx, taskID)
	if err != nil {
		return domain.Task{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, taskID, domain.ReadPermission); err != nil {
		return domain.Task{}, err
	}

	task, err := uc.taskRepo.GetTask(ctx, taskID)
	if err != nil {
		return domain.Task{}, err
	}

	task.Ancestors = ancestors
	return task, nil
}

func (uc *taskUsecase) CreateTask(ctx context.Context, task domain.Task, parentResourceID uuid.UUID) (domain.Task, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Task{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Task{}, err
	}

	if task.Assignee != nil {
		task.Status = "assigned"
	} else {
		task.Status = "open"
	}

	task.ClosedAt = nil
	task.UpdateCounters()

	resource := domain.Resource{
		ResourceBase: task.ResourceBase,
		Type:         domain.TypeTask,
	}

	err = uc.taskRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rh.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			task.ID = createdResource.ID
			task.BirthTime = createdResource.BirthTime
			task.UserID = createdResource.CreatorID
		}

		if err := uc.taskRepo.InsertTask(txCtx, task); err != nil {
			return err
		}

		if task.Ancestors, err = uc.rh.GetAncestors(txCtx, task.ID); err != nil {
			return nil
		}

		if err := uc.rh.UpdateCounters(txCtx, task.Counters, append(task.Ancestors.IDs(), task.ID)...); err != nil {
			return err
		}

		return nil
	})

	return task, err
}

func (uc *taskUsecase) UpdateTask(ctx context.Context, taskID uuid.UUID, task domain.Task) (domain.Task, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Task{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, taskID, domain.WritePermission); err != nil {
		return domain.Task{}, err
	}

	err = uc.taskRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		original, err := uc.taskRepo.GetTaskWithLock(txCtx, taskID)
		if err != nil {
			return err
		}

		task.ID = original.ID

		if original.Assignee != nil && task.Assignee == nil {
			task.Status = "open"
		}

		if task.IsOpen() {
			task.Comment = nil
		}

		task.Counters = original.Counters
		task.UpdateCounters()

		countersDifference := task.Counters.Substract(original.Counters)

		if err := uc.rh.TouchResource(txCtx, taskID, user.ID); err != nil {
			return err
		}

		if err := uc.taskRepo.SaveTask(txCtx, task); err != nil {
			return err
		}

		if task.Ancestors, err = uc.rh.GetAncestors(txCtx, taskID); err != nil {
			return nil
		}

		if err := uc.rh.UpdateCounters(txCtx, countersDifference, append(task.Ancestors.IDs(), taskID)...); err != nil {
			return err
		}

		return nil
	})

	return task, err
}

func (uc *taskUsecase) DeleteTask(ctx context.Context, taskID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, taskID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.taskRepo.GetTask(ctx, taskID)
	if err != nil {
		return err
	}

	return uc.rh.DeleteResource(ctx, taskID, user.ID)
}