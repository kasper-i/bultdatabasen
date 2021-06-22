package authorizer

import (
	"bultdatabasen/auth"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"net/http"
	"strings"

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
		var err error

		if r.Method == "OPTIONS" || r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		var userID string = r.Context().Value("user_id").(string)

		if r.Method == "GET" && (r.URL.Path == "/users/myself" || r.URL.Path == "/resources") {
			next.ServeHTTP(w, r)
			return
		}

		if (r.Method == "GET" || r.Method == "POST") && r.URL.Path == "/areas" {
			next.ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, "/users/") {
			if userID == vars["userID"] {
				next.ServeHTTP(w, r)
				return
			} else {
				writeForbidden(w, resourceID)
				return
			}
		}

		if resourceID == model.RootID {
			writeForbidden(w, resourceID)
			return
		}

		roles := auth.GetRoles(model.DB, userID)

		for _, role := range roles {
			if role.ResourceID == resourceID {
				grantAccess(w, r, role.Role)
				next.ServeHTTP(w, r)
				return
			}
		}

		var ancestors []model.Resource

		if ancestors, err = model.GetAncestors(model.DB, resourceID); err != nil {
			writeForbidden(w, resourceID)
			return
		}

		for _, ancestor := range ancestors {
			for _, role := range roles {
				if role.ResourceID == ancestor.ID {
					grantAccess(w, r, role.Role)
					next.ServeHTTP(w, r)
					return
				}
			}
		}

		writeForbidden(w, resourceID)
	})
}

func grantAccess(w http.ResponseWriter, r *http.Request, role string) {
	if r.Method == "GET" || r.Method == "HEAD" {
		w.Header().Set("Role", role)
	}
}

func writeForbidden(w http.ResponseWriter, resourceID string) {
	err := utils.Error{
		Status:     http.StatusForbidden,
		Message:    "Forbidden",
		ResourceID: &resourceID,
	}

	w.WriteHeader(http.StatusForbidden)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(err)
}
