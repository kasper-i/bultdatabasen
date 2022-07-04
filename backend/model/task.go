package model

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ResourceBase
	Status      string     `json:"status"`
	Description string     `json:"description"`
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

func (sess Session) GetTasks(resourceID string, pagination Pagination, includeCompleted bool) ([]Task, error) {
	var tasks []Task = make([]Task, 0)

	var where string = "TRUE"
	if (!includeCompleted) {
		where = "status IN ('open', 'assigned')"
	}

	query := fmt.Sprintf("%s AND %s %s", getDescendantsQuery("task"), where, pagination.ToSQL());

	if err := sess.DB.Raw(query, resourceID).Scan(&tasks).Error; err != nil {
		return nil, err
	}

	return tasks, nil
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

func (sess Session) CreateTask(task *Task, parentResourceID string) error {
	task.ID = uuid.Must(uuid.NewRandom()).String()
	task.ParentID = parentResourceID

	if task.Assignee != nil {
		task.Status = "assigned"
	} else {
		task.Status = "open"
	}

	task.ClosedAt = nil

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
		return nil
	})

	return err
}

func (sess Session) UpdateTask(task *Task, taskID string) error {
	original, err := sess.GetTask(taskID)
	if err != nil {
		return err
	}

	task.ID = original.ID
	task.ParentID = original.ParentID

	if original.Assignee != nil && task.Assignee == nil {
		task.Status = "open"
	}

	if task.Status == "closed" {
		now := time.Now()
		task.ClosedAt = &now
	}

	return sess.Transaction(func(sess Session) error {
		if err := sess.touchResource(taskID); err != nil {
			return err
		}

		if err := sess.DB.Updates(task).Error; err != nil {
			return err
		}

		return nil
	})
}

func (sess Session) DeleteTask(resourceID string) error {
	return sess.deleteResource(resourceID)
}
