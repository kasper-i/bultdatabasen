package domain

import "time"

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
