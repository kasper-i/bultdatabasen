package model

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ResourceBase
	Status      string     `json:"status"`
	Description string     `json:"description"`
	Priority    int        `json:"priority"`
	Assignee    *string    `gorm:"->" json:"assignee,omitempty"`
	Comment     *string    `json:"comment,omitempty"`
	BirthTime   time.Time  `gorm:"->;column:btime" json:"createdAt"`
	UserID      string     `gorm:"->;column:buser_id" json:"userId"`
	ClosedAt    *time.Time `json:"closedAt,omitempty"`
}

func (Task) TableName() string {
	return "task"
}

func (task *Task) IsOpen() bool {
	return task.Status == "open" || task.Status == "assigned"
}

func (task *Task) UpdateCounters() {
	if task.IsOpen() {
		task.Counters.OpenTasks = 1
	} else {
		task.Counters.OpenTasks = 0
	}
}

func (sess Session) GetTasks(resourceID uuid.UUID, pagination Pagination, statuses []string) ([]Task, Meta, error) {
	var tasks []Task = make([]Task, 0)
	var meta Meta = Meta{}

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

	dataQuery := fmt.Sprintf("%s SELECT * FROM tree INNER JOIN resource ON tree.resource_id = resource.leaf_of INNER JOIN task ON resource.id = task.id WHERE %s ORDER BY priority ASC %s", withTreeQuery(), where, pagination.ToSQL())

	if err := sess.DB.Raw(dataQuery, params...).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := sess.DB.Raw(countQuery, params...).Scan(&meta).Error; err != nil {
		return nil, meta, err
	}

	return tasks, meta, nil
}

func (sess Session) GetTask(resourceID uuid.UUID) (*Task, error) {
	var task Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) getTaskWithLock(resourceID uuid.UUID) (*Task, error) {
	var task Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ? FOR UPDATE`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) CreateTask(task *Task, parentResourceID uuid.UUID) error {
	if task.Assignee != nil {
		task.Status = "assigned"
	} else {
		task.Status = "open"
	}

	task.ClosedAt = nil
	task.UpdateCounters()

	resource := Resource{
		ResourceBase: task.ResourceBase,
		Type:         TypeTask,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, parentResourceID); err != nil {
			return err
		}
	
		task.ID = resource.ID
		task.BirthTime = resource.BirthTime
		task.UserID = resource.CreatorID

		if err := sess.DB.Create(&task).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(task.ID, task.Counters); err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(task.ID); err != nil {
			return nil
		} else {
			task.Ancestors = &ancestors
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) UpdateTask(task *Task, taskID uuid.UUID) error {
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

		if err := sess.TouchResource(taskID); err != nil {
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

		if err := sess.updateCountersForResourceAndAncestors(taskID, countersDifference); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) DeleteTask(resourceID uuid.UUID) error {
	return sess.DeleteResource(resourceID)
}
