package model

import "bultdatabasen/domain"

func (sess Session) GetMaterials() ([]domain.Material, error) {
	var materials []domain.Material = make([]domain.Material, 0)

	query := "SELECT * FROM material ORDER BY name ASC"

	if err := sess.DB.Raw(query).Scan(&materials).Error; err != nil {
		return nil, err
	}

	return materials, nil
}
