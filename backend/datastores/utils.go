package datastores

import (
	"bultdatabasen/domain"
	"fmt"
)

func paginationToSql(pagination *domain.Pagination) string {
	return fmt.Sprintf("LIMIT %d OFFSET %d", pagination.ItemsPerPage, (pagination.Page-1)*pagination.ItemsPerPage)
}

func withTreeQuery() string {
	return `WITH tree AS (SELECT * FROM tree WHERE path <@ (SELECT path FROM tree WHERE resource_id = ? LIMIT 1))`
}
