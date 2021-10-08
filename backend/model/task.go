package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID          string  `gorm:"primaryKey" json:"id"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
	Assignee    *string `gorm:"->" json:"assignee,omitempty"`
	Comment     *string `json:"comment,omitempty"`
	ParentID    string  `gorm:"->" json:"parentId"`
}

func (Task) TableName() string {
	return "task"
}

func (sess Session) GetTasks(resourceID string) ([]Task, error) {
	var tasks []Task = make([]Task, 0)

	if err := sess.DB.Raw(getDescendantsQuery("task"), resourceID).Scan(&tasks).Error; err != nil {
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

	resource := Resource{
		ID:       task.ID,
		Type:     "task",
		ParentID: &parentResourceID,
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
	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Delete(&Task{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := sess.DB.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
