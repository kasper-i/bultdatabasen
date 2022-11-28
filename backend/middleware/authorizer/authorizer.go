package authorizer

import (
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
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
		var userID string
		var ancestors []model.Resource

		resourceID, err := uuid.Parse(vars["resourceID"])
		if err != nil {
			utils.WriteError(w, err)
			return
		}

		if authenticator.IsPublic(r) {
			next.ServeHTTP(w, r)
			return
		}

		if value, ok := r.Context().Value("user_id").(string); ok {
			userID = value
		}

		if value, ok := r.Context().Value("ancestors").([]model.Resource); ok {
			ancestors = value
		}

		if r.Method == "POST" && r.URL.Path == "/areas" {
			next.ServeHTTP(w, r)
			return
		}

		if r.URL.Path == "/users/myself" {
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

		if maxRole := GetMaxRole(resourceID, ancestors, userID); maxRole == nil || maxRole.Role != "owner" {
			writeForbidden(w, resourceID)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}

func GetMaxRole(resourceID uuid.UUID, ancestors []model.Resource, userID string) *model.ResourceRole {
	sess := model.NewSession(model.DB, &userID)

	if resourceID.String() == model.RootID {
		return nil
	}

	roles := sess.GetRoles(userID)

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

	var maxRole *model.ResourceRole = nil

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

func roleValue(role *model.ResourceRole) int {
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

func max(r1, r2 *model.ResourceRole) *model.ResourceRole {
	if roleValue(r1) >= roleValue(r2) {
		return r1
	} else {
		return r2
	}
}

func writeForbidden(w http.ResponseWriter, resourceID uuid.UUID) {
	err := utils.Error{
		Status:     http.StatusForbidden,
		Message:    "Forbidden",
		ResourceID: resourceID,
	}

	w.WriteHeader(http.StatusForbidden)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(err)
}
