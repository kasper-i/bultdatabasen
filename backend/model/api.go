package model

import (
	"fmt"
	"net/url"
	"strconv"
)

type Pagination struct {
	Page         int
	ItemsPerPage int
}

type Meta struct {
	TotalItems int `gorm:"column:totalItems" json:"totalItems"`
}

func (pagination *Pagination) ParseQuery(query url.Values) error {
	if page, err := strconv.Atoi(query.Get("page")); err == nil {
		pagination.Page = page
	} else {
		return err
	}

	if itemsPerPage, err := strconv.Atoi(query.Get("itemsPerPage")); err == nil {
		pagination.ItemsPerPage = itemsPerPage
	} else {
		return err
	}

	return nil
}

func (pagination *Pagination) ToSQL() string {
	return fmt.Sprintf("LIMIT %d OFFSET %d", pagination.ItemsPerPage, (pagination.Page-1)*pagination.ItemsPerPage)
}

func (pagination *Pagination) Valid() bool {
	return pagination.Page > 0 && pagination.ItemsPerPage <= 1000
}
