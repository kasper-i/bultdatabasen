package model

type Material struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (Material) TableName() string {
	return "material"
}

func (sess Session) GetMaterials() ([]Material, error) {
	var materials []Material = make([]Material, 0)

	query := "SELECT * FROM material ORDER BY name ASC"

	if err := sess.DB.Raw(query).Scan(&materials).Error; err != nil {
		return nil, err
	}

	return materials, nil
}
