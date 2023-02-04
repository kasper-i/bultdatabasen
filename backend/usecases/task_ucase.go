package usecases

import (
	"bultdatabasen/domain"
	"context"

	"github.com/google/uuid"
)

type taskUsecase struct {
	repo          domain.Datastore
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
}

func NewTaskUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, store domain.Datastore) domain.TaskUsecase {
	return &taskUsecase{
		repo:          store,
		authenticator: authenticator,
		authorizer:    authorizer,
	}
}

func (uc *taskUsecase) GetTasks(ctx context.Context, resourceID uuid.UUID, pagination domain.Pagination, statuses []string) ([]domain.Task, domain.Meta, error) {
	return uc.repo.GetTasks(ctx, resourceID, pagination, statuses)
}

func (uc *taskUsecase) GetTask(ctx context.Context, cragID uuid.UUID) (domain.Task, error) {
	ancestors, err := uc.repo.GetAncestors(ctx, cragID)
	if err != nil {
		return domain.Task{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, cragID, domain.ReadPermission); err != nil {
		return domain.Task{}, err
	}

	crag, err := uc.repo.GetTask(ctx, cragID)
	if err != nil {
		return domain.Task{}, err
	}

	crag.Ancestors = ancestors
	return crag, nil
}

func (uc *taskUsecase) CreateTask(ctx context.Context, task domain.Task, parentResourceID uuid.UUID) (domain.Task, error) {
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

	err := uc.repo.Transaction(func(store domain.Datastore) error {
		if createdResource, err := createResource(ctx, store, resource, parentResourceID); err != nil {
			return err
		} else {
			task.ID = createdResource.ID
			task.BirthTime = createdResource.BirthTime
			task.UserID = createdResource.CreatorID
		}

		if err := uc.repo.InsertTask(ctx, task); err != nil {
			return err
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, task.ID, task.Counters); err != nil {
			return err
		}

		if ancestors, err := store.GetAncestors(ctx, task.ID); err != nil {
			return nil
		} else {
			task.Ancestors = ancestors
		}

		return nil
	})

	return task, err
}

func (uc *taskUsecase) UpdateTask(ctx context.Context, task domain.Task, taskID uuid.UUID) (domain.Task, error) {
	err := uc.repo.Transaction(func(store domain.Datastore) error {
		original, err := store.GetTaskWithLock(taskID)
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

		if err := store.TouchResource(ctx, taskID, ""); err != nil {
			return err
		}

		if err := store.SaveTask(ctx, task); err != nil {
			return err
		}

		if ancestors, err := uc.repo.GetAncestors(ctx, taskID); err != nil {
			return nil
		} else {
			task.Ancestors = ancestors
		}

		if err := updateCountersForResourceAndAncestors(ctx, store, taskID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	return task, err
}

func (uc *taskUsecase) DeleteTask(ctx context.Context, resourceID uuid.UUID) error {
	return deleteResource(ctx, uc.repo, resourceID)
}
