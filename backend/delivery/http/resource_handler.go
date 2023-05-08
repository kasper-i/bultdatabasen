package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type resourceHandler struct {
	resourceUsecase domain.ResourceUsecase
	teamUsecase     domain.TeamUsecase
}

type resourcePatch struct {
	ParentID uuid.UUID `json:"parentId"`
}

func NewResourceHandler(router *mux.Router, resourceUsecase domain.ResourceUsecase, teamUsecase domain.TeamUsecase) {
	handler := &resourceHandler{
		resourceUsecase: resourceUsecase,
		teamUsecase: teamUsecase,
	}

	router.HandleFunc("/resources/{resourceID}", handler.GetResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}", handler.UpdateResource).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/ancestors", handler.GetAncestors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/children", handler.GetChildren).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources", handler.Search).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/maintainers", handler.GetMaintainers).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *resourceHandler) GetResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if resource, err := hdlr.resourceUsecase.GetResource(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, resource)
	}
}

func (hdlr *resourceHandler) UpdateResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var patch resourcePatch
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	if err := json.Unmarshal(reqBody, &patch); err != nil {
		writeError(w, err)
		return
	}

	switch {
	case patch.ParentID != uuid.Nil:
		newParentID := patch.ParentID

		if err := hdlr.resourceUsecase.MoveResource(r.Context(), id, newParentID); err != nil {
			writeError(w, err)
		} else {
			writeResponse(w, http.StatusNoContent, nil)
		}

		return
	}

	writeResponse(w, http.StatusBadRequest, nil)
}

func (hdlr *resourceHandler) GetAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if ancestors, err := hdlr.resourceUsecase.GetAncestors(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, ancestors)
	}
}

func (hdlr *resourceHandler) GetChildren(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if children, err := hdlr.resourceUsecase.GetChildren(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, children)
	}
}

func (hdlr *resourceHandler) Search(w http.ResponseWriter, r *http.Request) {
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

	if results, err := hdlr.resourceUsecase.Search(r.Context(), name); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, results)
	}
}

func (hdlr *resourceHandler) GetMaintainers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if maintainers, err := hdlr.teamUsecase.GetMaintainers(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, maintainers)
	}
}
