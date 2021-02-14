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

	db.Raw(`WITH RECURSIVE cte (id, name, type, parent_id) AS (
		SELECT id, name, type, parent_id
		FROM resource
		WHERE id = ?
	UNION DISTINCT
		SELECT child.id, child.name, child.type, child.parent_id
		FROM resource child
		INNER JOIN cte ON child.parent_id = cte.id
		WHERE depth <= ?
	)
	SELECT * FROM cte
	INNER JOIN route ON cte.id = route.id`, resourceID, DepthRoute).Scan(&routes)

	return routes
}
