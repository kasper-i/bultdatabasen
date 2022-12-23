package domain

type Sector struct {
	ResourceBase
	Name string `json:"name"`
}

func (Sector) TableName() string {
	return "sector"
}
