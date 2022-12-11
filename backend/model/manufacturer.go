package model

import "github.com/google/uuid"

type Manufacturer struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (Manufacturer) TableName() string {
	return "manufacturer"
}

func (sess Session) GetManufacturers() ([]Manufacturer, error) {
	var manufacturers []Manufacturer = make([]Manufacturer, 0)

	query := "SELECT * FROM manufacturer ORDER BY name ASC"

	if err := sess.DB.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}
