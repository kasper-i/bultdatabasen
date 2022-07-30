package model

import (
	"fmt"
)

type Manufacturer struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (Manufacturer) TableName() string {
	return "material"
}

func (sess Session) GetManufacturers() ([]Manufacturer, error) {
	var manufacturers []Manufacturer = make([]Manufacturer, 0)

	query := fmt.Sprintf("SELECT * FROM manufacturer ORDER BY name ASC")

	if err := sess.DB.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}
