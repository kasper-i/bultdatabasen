package domain

type Crag struct {
	ResourceBase
	Name string `json:"name"`
}

func (Crag) TableName() string {
	return "crag"
}
