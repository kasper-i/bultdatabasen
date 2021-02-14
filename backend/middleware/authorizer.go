package authorizer

import (
	"bultdatabasen/auth"
	"bultdatabasen/model"
	"net/http"

	"github.com/gorilla/mux"
)

type authorizer struct {
}

func New() *authorizer {
	return &authorizer{}
}

func (authorizer *authorizer) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        vars := mux.Vars(r)
	    resourceID := vars["resourceID"]
		userId := "be44169f-6e27-11eb-8c37-7085c2c40195"

		roles := auth.GetRoles(model.DB, userId)

		for _, role := range roles {
			if role.ResourceID == resourceID {
				next.ServeHTTP(w, r)
				return
			}
		}

		ancestors := model.GetAncestors(model.DB, resourceID)

		for _, ancestor := range ancestors {
			for _, role := range roles {
				if role.ResourceID == ancestor.ID {
					next.ServeHTTP(w, r)
					return
				}
			}
		}	

		http.Error(w, "Forbidden", http.StatusForbidden)
    })
}