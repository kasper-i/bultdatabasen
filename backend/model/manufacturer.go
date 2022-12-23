package model

import "bultdatabasen/domain"

func (sess Session) GetManufacturers() ([]domain.Manufacturer, error) {
	var manufacturers []domain.Manufacturer = make([]domain.Manufacturer, 0)

	query := "SELECT * FROM manufacturer ORDER BY name ASC"

	if err := sess.DB.Raw(query).Scan(&manufacturers).Error; err != nil {
		return nil, err
	}

	return manufacturers, nil
}
