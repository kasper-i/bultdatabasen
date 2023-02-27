package domain

type Pagination struct {
	Page         int
	ItemsPerPage int
}

func (pagination *Pagination) Valid() bool {
	return pagination.Page > 0 && pagination.ItemsPerPage <= 25
}

type Meta struct {
	TotalItems int64 `gorm:"column:total_items" json:"totalItems"`
}
