package repositories

import (
	"bultdatabasen/domain"
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (store *psqlDatastore) GetTasks(ctx context.Context, resourceID uuid.UUID, pagination domain.Pagination, statuses []string) ([]domain.Task, domain.Meta, error) {
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

	if err := store.tx.Raw(dataQuery, params...).Scan(&tasks).Error; err != nil {
		return nil, meta, err
	}

	if err := store.tx.Raw(countQuery, params...).Scan(&meta).Error; err != nil {
		return nil, meta, err
	}

	return tasks, meta, nil
}

func (store *psqlDatastore) GetTask(ctx context.Context, resourceID uuid.UUID) (domain.Task, error) {
	var task domain.Task

	if err := store.tx.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ?`, resourceID).
		Scan(&task).Error; err != nil {
		return domain.Task{}, err
	}

	if task.ID == uuid.Nil {
		return domain.Task{}, gorm.ErrRecordNotFound
	}

	return task, nil
}

func (store *psqlDatastore) GetTaskWithLock(resourceID uuid.UUID) (domain.Task, error) {
	var task domain.Task

	if err := store.tx.Raw(`SELECT * FROM task INNER JOIN resource ON task.id = resource.id WHERE task.id = ? FOR UPDATE`, resourceID).
		Scan(&task).Error; err != nil {
		return domain.Task{}, err
	}

	if task.ID == uuid.Nil {
		return domain.Task{}, gorm.ErrRecordNotFound
	}

	return task, nil
}

func (store *psqlDatastore) InsertTask(ctx context.Context, task domain.Task) error {
	return store.tx.Create(&task).Error
}

func (store *psqlDatastore) SaveTask(ctx context.Context, task domain.Task) error {
	return store.tx.Select(
		"Status",
		"Description",
		"Priority",
		"Comment",
		"ClosedAt",
	).Updates(task).Error
}
