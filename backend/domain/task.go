package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ResourceBase
	Status      string     `json:"status"`
	Description string     `json:"description"`
	Priority    int        `json:"priority"`
	Assignee    *string    `gorm:"<-:false" json:"assignee,omitempty"`
	Comment     *string    `json:"comment,omitempty"`
	BirthTime   time.Time  `gorm:"->;column:btime" json:"createdAt"`
	Author      Author     `gorm:"<-:false;column:buser_id" json:"author"`
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

type TaskUsecase interface {
	GetTasks(ctx context.Context, resourceID uuid.UUID, pagination Pagination, statuses []string) (Page[Task], error)
	GetTask(ctx context.Context, taskID uuid.UUID) (Task, error)
	CreateTask(ctx context.Context, task Task, parentResourceID uuid.UUID) (Task, error)
	UpdateTask(ctx context.Context, taskID uuid.UUID, task Task) (Task, error)
	DeleteTask(ctx context.Context, taskID uuid.UUID) error
}

type TaskRepository interface {
	Transactor

	GetTasks(ctx context.Context, resourceID uuid.UUID, pagination Pagination, statuses []string) (Page[Task], error)
	GetTask(ctx context.Context, taskID uuid.UUID) (Task, error)
	GetTaskWithLock(ctx context.Context, taskID uuid.UUID) (Task, error)
	InsertTask(ctx context.Context, task Task) error
	SaveTask(ctx context.Context, task Task) error
}
