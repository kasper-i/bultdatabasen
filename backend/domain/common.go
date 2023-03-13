package domain

type Pagination struct {
	Page         int
	ItemsPerPage int
}

type meta struct {
	TotalItems int64 `gorm:"column:total_items" json:"totalItems"`
}

type Page[T any] struct {
	Data []T  `json:"data"`
	Meta meta `json:"meta"`
}

func EmptyPage[T any]() Page[T] {
	return Page[T]{
		Data: make([]T, 0),
	}
}
