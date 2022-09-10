package model

import (
	"bultdatabasen/utils"
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

func (task *Task) IsOpen() bool {
	return task.Status == "open" || task.Status == "assigned";
}

func (task *Task) CalculateCounters() Counters {
	counters := Counters{}

	if task.IsOpen() {
		counters.OpenTasks = 1
	}

	return counters
}

func (sess Session) GetTasks(resourceID string, pagination Pagination, includeCompleted bool) ([]Task, Meta, error) {
	var tasks []Task = make([]Task, 0)
	var meta Meta = Meta{}

	var where string = "TRUE"
	if !includeCompleted {
		where = "status IN ('open', 'assigned')"
	}

	countQuery := fmt.Sprintf("%s AND %s", buildDescendantsCountQuery("task"), where)

	dataQuery := fmt.Sprintf("%s AND %s ORDER BY btime DESC %s", buildDescendantsQuery("task"), where, pagination.ToSQL())

	if err := sess.DB.Raw(dataQuery, resourceID).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := sess.DB.Raw(countQuery, resourceID).Scan(&meta).Error; err != nil {
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
	ancestors, err := sess.GetAncestorsIncludingFosterParents(parentResourceID)
	if err != nil {
		return err
	}

	task.ID = uuid.Must(uuid.NewRandom()).String()
	task.ParentID = parentResourceID

	if task.Assignee != nil {
		task.Status = "assigned"
	} else {
		task.Status = "open"
	}

	task.ClosedAt = nil
	task.Counters = task.CalculateCounters()

	resource := Resource{
		ResourceBase: task.ResourceBase,
		Type:         "task",
		ParentID:     &parentResourceID,
	}	

	err = sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&task).Error; err != nil {
			return err
		}

		if err := sess.UpdateCounters(
			append(utils.Map(ancestors, func(ancestor Resource) string { return ancestor.ID }), parentResourceID, task.ID),
			task.Counters); err != nil {
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
	ancestors, err := sess.GetAncestorsIncludingFosterParents(taskID)
	if err != nil {
		return err
	}

	err = sess.Transaction(func(sess Session) error {
		original, err := sess.getTaskWithLock(taskID)
		if err != nil {
			return err
		}

		task.ID = original.ID
		task.ParentID = original.ParentID

		if original.Assignee != nil && task.Assignee == nil {
			task.Status = "open"
		}

		if !task.IsOpen() {
			now := time.Now()
			task.ClosedAt = &now
		}

		task.Counters = task.CalculateCounters()

		countersDifference := task.Counters.Substract(original.Counters)
	
		if err := sess.touchResource(taskID); err != nil {
			return err
		}

		if err := sess.DB.Updates(task).Error; err != nil {
			return err
		}

		if err := sess.UpdateCounters(
			append(utils.Map(ancestors, func(ancestor Resource) string { return ancestor.ID }), taskID),
			countersDifference); err != nil {
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
