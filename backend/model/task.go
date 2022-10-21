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
	ParentID    string     `gorm:"->" json:"parentId"`
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

func (sess Session) GetTasks(resourceID string, pagination Pagination, statuses []string) ([]Task, Meta, error) {
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

	countQuery := fmt.Sprintf("%s AND %s", buildDescendantsCountQuery("task"), where)

	dataQuery := fmt.Sprintf("%s AND %s ORDER BY priority ASC %s", buildDescendantsQuery("task"), where, pagination.ToSQL())

	if err := sess.DB.Raw(dataQuery, params...).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := sess.DB.Raw(countQuery, params...).Scan(&meta).Error; err != nil {
		return nil, meta, err
	}

	return tasks, meta, nil
}

func (sess Session) GetTask(resourceID string) (*Task, error) {
	var task Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) getTaskWithLock(resourceID string) (*Task, error) {
	var task Task

	if err := sess.DB.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ? FOR UPDATE`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func (sess Session) CreateTask(task *Task, parentResourceID string) error {
	task.ID = uuid.Must(uuid.NewRandom()).String()
	task.ParentID = parentResourceID

	if task.Assignee != nil {
		task.Status = "assigned"
	} else {
		task.Status = "open"
	}

	task.ClosedAt = nil
	task.UpdateCounters()

	resource := Resource{
		ResourceBase: task.ResourceBase,
		Type:         "task",
		ParentID:     &parentResourceID,
	}

	err := sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&task).Error; err != nil {
			return err
		}

		if err := sess.updateCountersForResourceAndAncestors(task.ID, task.Counters); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (sess Session) UpdateTask(task *Task, taskID string) error {
	err := sess.Transaction(func(sess Session) error {
		original, err := sess.getTaskWithLock(taskID)
		if err != nil {
			return err
		}

		task.ID = original.ID
		task.ParentID = original.ParentID

		if original.Assignee != nil && task.Assignee == nil {
			task.Status = "open"
		}

		if task.IsOpen() {
			task.Comment = nil
		}

		task.Counters = original.Counters
		task.UpdateCounters()

		countersDifference := task.Counters.Substract(original.Counters)

		if err := sess.touchResource(taskID); err != nil {
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

func (sess Session) DeleteTask(resourceID string) error {
	return sess.deleteResource(resourceID)
}
