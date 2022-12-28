package usecases

import (
	"bultdatabasen/domain"
	"fmt"
)

func paginationToSql(pagination *domain.Pagination) string {
	return fmt.Sprintf("LIMIT %d OFFSET %d", pagination.ItemsPerPage, (pagination.Page-1)*pagination.ItemsPerPage)
}
