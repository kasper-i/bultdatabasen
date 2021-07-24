package authorizer

import (
	"bultdatabasen/auth"
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

const (
	RoleOwner string = "owner"
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
		var userID string
		var isAuthenticated bool
		
		if id, ok := r.Context().Value("user_id").(string); ok {
			userID = id
			isAuthenticated = true
		}

		if authenticator.IsPublic(r) {
			if isAuthenticated && r.Method != "OPTIONS" {
				if maxRole := getMaxRole(resourceID, userID); maxRole != nil {
					attachRole(w, r, maxRole.Role)
				}				
			}	
			
			next.ServeHTTP(w, r)
			return
		}

		if r.Method == "POST" && r.URL.Path == "/areas" {
			next.ServeHTTP(w, r)
			return
		}

		if r.Method == "GET" && r.URL.Path == "/users/myself" {
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

		if maxRole := getMaxRole(resourceID, userID); maxRole == nil {
			writeForbidden(w, resourceID)
		} else {
			attachRole(w, r, maxRole.Role)
			next.ServeHTTP(w, r)
		}
	})
}

func getMaxRole(resourceID, userID string) *auth.AssignedRole {
	var err error

	if resourceID == model.RootID {
		return nil
	}

	roles := auth.GetRoles(model.DB, userID)

	if len(roles) == 0 {
		return nil
	}

	for _, role := range roles {
		if role.ResourceID == resourceID {
			if role.Role == RoleOwner || len(roles) == 1 {
				return &role
			}
		}
	}

	var ancestors []model.Resource

	if ancestors, err = model.GetAncestors(model.DB, resourceID); err != nil {
		return nil
	}

	var maxRole *auth.AssignedRole = nil

	for _, ancestor := range ancestors {
		for _, role := range roles {
			if role.ResourceID == ancestor.ID {
				maxRole = max(maxRole, &role)
			}
		}
	}

	if maxRole != nil {
		return maxRole
	}

	return nil
}

func roleValue(role *auth.AssignedRole) int {
	if role == nil {
		return 0
	}

	switch role.Role {
	case RoleOwner:
		return 1
	default:
		return 0
	}
}

func max(r1, r2 *auth.AssignedRole) *auth.AssignedRole {
	if roleValue(r1) >= roleValue(r2) {
		return r1
	} else {
		return r2
	}
}

func attachRole(w http.ResponseWriter, r *http.Request, role string) {
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
