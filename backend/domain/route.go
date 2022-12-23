package domain

type Route struct {
	ResourceBase
	Name      string  `json:"name"`
	AltName   *string `json:"altName,omitempty"`
	Year      *int32  `json:"year,omitempty"`
	Length    *int32  `json:"length,omitempty"`
	RouteType *string `json:"routeType,omitempty"`
}

func (Route) TableName() string {
	return "route"
}

func (route *Route) UpdateCounters() {
	route.Counters.Routes = 1
}
