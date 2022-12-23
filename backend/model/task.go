package model

import (
	"bultdatabasen/domain"
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (sess Session) GetTasks(ctx context.Context, resourceID uuid.UUID, pagination domain.Pagination, statuses []string) ([]domain.Task, domain.Meta, error) {
	var tasks []domain.Task = make([]domain.Task, 0)
	var meta domain.Meta = domain.Meta{}

	params := make([]interface{}, 1)
	params[0] = resourceID

	var where string = "TRUE"
	if len(statuses) > 0 {
		var placeholders []string = make([]string, 0)

		for _, status := range statuses {
			placeholders = append(placeholders, "?")
			params = append(params, status)
		}

		where = fmt.Sprintf("status IN (%s)", strings.Join(placeholders, ", "))
	}

	countQuery := fmt.Sprintf("%s SELECT COUNT(task.id) AS total_items FROM tree INNER JOIN resource ON tree.resource_id = resource.leaf_of INNER JOIN task ON resource.id = task.id WHERE %s", withTreeQuery(), where)

	dataQuery := fmt.Sprintf("%s SELECT * FROM tree INNER JOIN resource ON tree.resource_id = resource.leaf_of INNER JOIN task ON resource.id = task.id WHERE %s ORDER BY priority ASC %s", withTreeQuery(), where, paginationToSql(&pagination))

	if err := sess.DB.Raw(dataQuery, params...).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := sess.DB.Raw(countQuery, params...).Scan(&meta).Error; err != nil {
		return nil, meta, err
	}

	return tasks, meta, nil
}

func (sess Session) GetTask(ctx context.Context, resourceID uuid.UUID) (*domain.Task, error) {
	var task domain.Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) getTaskWithLock(resourceID uuid.UUID) (*domain.Task, error) {
	var task domain.Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ? FOR UPDATE`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) CreateTask(ctx context.Context, task *domain.Task, parentResourceID uuid.UUID) error {
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

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(ctx, &resource, parentResourceID); err != nil {
			return err
		}

		task.ID = resource.ID
		task.BirthTime = resource.BirthTime
		task.UserID = resource.CreatorID

		if err := sess.DB.Create(&task).Error; err != nil {
			return err
		}

		if err := sess.UpdateCountersForResourceAndAncestors(ctx, task.ID, task.Counters); err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(ctx, task.ID); err != nil {
			return nil
		} else {
			task.Ancestors = ancestors
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) UpdateTask(ctx context.Context, task *domain.Task, taskID uuid.UUID) error {
	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getTaskWithLock(taskID)
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

		if err := sess.TouchResource(ctx, taskID); err != nil {
			return err
		}

		if err := sess.DB.Select(
			"Status",
			"Description",
			"Priority",
			"Comment",
			"ClosedAt",
		).Updates(task).Error; err != nil {
			return err
		}

		if err := sess.UpdateCountersForResourceAndAncestors(ctx, taskID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) DeleteTask(ctx context.Context, resourceID uuid.UUID) error {
	return sess.DeleteResource(ctx, resourceID)
}
