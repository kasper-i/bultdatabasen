package model

import "gorm.io/gorm"

type Route struct {
	ID        string  `gorm:"primaryKey" json:"id"`
	Name      string  `json:"name"`
	AltName   *string `json:"alt_name"`
	Year      *int32  `json:"year"`
	RouteType *string `json:"route_type"`
}

func (Route) TableName() string {
	return "route"
}

func GetRoutes(db *gorm.DB, resourceID string) []Route {
	var routes []Route

	db.Raw(getDescendantsQuery(DepthRoute, "route"), resourceID, DepthRoute).Scan(&routes)

	return routes
}
