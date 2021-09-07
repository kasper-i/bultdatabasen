package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID          string  `gorm:"primaryKey" json:"id"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
	Assignee    *string `gorm:"->" json:"assignee"`
	Comment     *string `json:"comment"`
	ParentID    string  `gorm:"->" json:"parentId"`
}

func (Task) TableName() string {
	return "task"
}

func GetTasks(db *gorm.DB, resourceID string) ([]Task, error) {
	var tasks []Task = make([]Task, 0)

	if err := db.Raw(getDescendantsQuery("task"), resourceID).Scan(&tasks).Error; err != nil {
		return nil, err
	}

	return tasks, nil
}

func GetTask(db *gorm.DB, resourceID string) (*Task, error) {
	var task Task

	if err := db.Raw(`SELECT * FROM task LEFT JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return nil, err
	}

	if task.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &task, nil
}

func CreateTask(db *gorm.DB, task *Task, parentResourceID string) error {
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

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&task).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func UpdateTask(db *gorm.DB, task *Task, taskID string) error {
	original, err := GetTask(db, taskID)
	if err != nil {
		return err
	}

	task.ID = original.ID
	task.ParentID = original.ParentID

	if task.Assignee == nil {
		task.Status = "open"
	}

	return db.Updates(task).Error
}

func DeleteTask(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Task{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
