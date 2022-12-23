package domain

type Area struct {
	ResourceBase
	Name string `json:"name"`
}

func (Area) TableName() string {
	return "area"
}
