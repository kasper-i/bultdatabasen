package model

type Route struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"-" json:"name"`
	AltName     *string `json:"alt_name"`
	Year     *int32 `json:"year"`
	RouteType    *string `json:"route_type"`
}

func (Route) TableName() string {
	return "route"
}

