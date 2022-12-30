package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/usecases"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ResourceHandler struct {
	ResourceUsecase domain.ResourceUsecase
	store domain.Datastore
}

func NewResourceHandler(router *mux.Router, resourceUsecase domain.ResourceUsecase, store domain.Datastore) {
	handler := &ResourceHandler{
		ResourceUsecase: resourceUsecase,
		store: store,
	}

	router.HandleFunc("/resources/{resourceID}", handler.GetResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}", handler.UpdateResource).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/ancestors", handler.GetAncestors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/children", handler.GetChildren).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/role", handler.GetUserRoleForResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources", handler.Search).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *ResourceHandler) GetResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if resource, err := hdlr.ResourceUsecase.GetResource(r.Context(), id); err != nil {
		utils.WriteError(w, err)
	} else {
		resource.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, resource)
	}
}

func (hdlr *ResourceHandler) ownsResource(r *http.Request, resourceID uuid.UUID) bool {
	var ancestors []domain.Resource
	var userID string
	var err error

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = value
	}

	if ancestors, err = hdlr.ResourceUsecase.GetAncestors(r.Context(), resourceID); err != nil {
		return false
	}

	role := authorizer.GetMaxRole(r.Context(), hdlr.store, resourceID, ancestors, userID)
	if role == nil {
		return false
	}

	return role.Role == authorizer.RoleOwner
}

func (hdlr *ResourceHandler) UpdateResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var patch usecases.ResourcePatch
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	if err := json.Unmarshal(reqBody, &patch); err != nil {
		utils.WriteError(w, err)
		return
	}

	switch {
	case patch.ParentID != uuid.Nil:
		newParentID := patch.ParentID

		if newParentID.String() != domain.RootID && !hdlr.ownsResource(r, newParentID) {
			utils.WriteResponse(w, http.StatusForbidden, nil)
			return
		}

		if err := hdlr.ResourceUsecase.MoveResource(r.Context(), id, newParentID); err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusNoContent, nil)
		}

		return
	}

	utils.WriteResponse(w, http.StatusBadRequest, nil)
}

func (hdlr *ResourceHandler) GetAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if ancestors, err := hdlr.ResourceUsecase.GetAncestors(r.Context(), id); err != nil {
		utils.WriteError(w, err)
	} else {
		for i, j := 0, len(ancestors)-1; i < j; i, j = i+1, j-1 {
			ancestors[i], ancestors[j] = ancestors[j], ancestors[i]
		}

		utils.WriteResponse(w, http.StatusOK, ancestors)
	}
}

func (hdlr *ResourceHandler) GetChildren(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if children, err := hdlr.ResourceUsecase.GetChildren(r.Context(), id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, children)
	}
}

func (hdlr *ResourceHandler) GetUserRoleForResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var userID string
	var ancestors []domain.Resource

	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	role := domain.ResourceRole{
		Role:       "guest",
		ResourceID: id,
	}

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = value
	}

	if value, ok := r.Context().Value("ancestors").([]domain.Resource); ok {
		ancestors = value
	}

	if maxRole := authorizer.GetMaxRole(r.Context(), hdlr.store, id, ancestors, userID); maxRole != nil {
		role.Role = maxRole.Role
	}

	utils.WriteResponse(w, http.StatusOK, role)
}

func (hdlr *ResourceHandler) Search(w http.ResponseWriter, r *http.Request) {
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

	if results, err := hdlr.ResourceUsecase.Search(r.Context(), name); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, results)
	}
}
