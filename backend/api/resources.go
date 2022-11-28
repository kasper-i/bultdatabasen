package api

import (
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetResource(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if resource, err := sess.GetResource(id); err != nil {
		utils.WriteError(w, err)
	} else {
		resource.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, resource)
	}
}

func ownsResource(r *http.Request, sess model.Session, resourceID string) bool {
	var ancestors []model.Resource
	var userID string
	var err error

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = value
	}

	if ancestors, err = sess.GetAncestors(resourceID); err != nil {
		return false
	}

	role := authorizer.GetMaxRole(resourceID, ancestors, userID)
	if role == nil {
		return false
	}

	return role.Role == authorizer.RoleOwner
}

func UpdateResource(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	id := vars["resourceID"]
	var patch model.ResourcePatch

	reqBody, _ := io.ReadAll(r.Body)
	if err := json.Unmarshal(reqBody, &patch); err != nil {
		utils.WriteError(w, err)
		return
	}

	switch {
	case patch.ParentID != nil:
		newParentID := *patch.ParentID

		if newParentID != model.RootID && !ownsResource(r, sess, newParentID) {
			utils.WriteResponse(w, http.StatusForbidden, nil)
			return
		}

		if err := sess.Move(id, newParentID); err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusNoContent, nil)
		}

		return
	}

	utils.WriteResponse(w, http.StatusBadRequest, nil)
}

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
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if children, err := sess.GetChildren(id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, children)
	}
}

func GetUserRoleForResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]
	var userID string
	var ancestors []model.Resource
	role := model.ResourceRole{
		Role:       "guest",
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
