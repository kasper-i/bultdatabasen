package api

import (
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func GetAncestors(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if ancestors, err := sess.GetAncestors(id); err != nil {
		utils.WriteError(w, err)
	} else {
		for i, j := 0, len(ancestors)-1; i < j; i, j = i+1, j-1 {
			ancestors[i], ancestors[j] = ancestors[j], ancestors[i]
		}

		utils.WriteResponse(w, http.StatusOK, ancestors)
	}
}

func GetChildren(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if children, err := sess.GetChildren(id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, children)
	}
}

func GetCounts(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if counts, err := sess.GetCounts(id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, counts)
	}
}

func GetUserRoleForResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]
	var userID string
	var ancestors []model.Resource
	role := model.ResourceRole {
		Role: "guest",
		ResourceID: id,
	}

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = value
	}

	if value, ok := r.Context().Value("ancestors").([]model.Resource); ok {
		ancestors = value
	}

	if maxRole := authorizer.GetMaxRole(id, ancestors, userID); maxRole != nil {
		role.Role = maxRole.Role
	}

	utils.WriteResponse(w, http.StatusOK, role)
}

func Search(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	names, ok := r.URL.Query()["name"]

	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	name := strings.TrimSpace(names[0])

	if name == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if results, err := sess.Search(name); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, results)
	}
}
