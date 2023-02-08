package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/usecases"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ResourceHandler struct {
	ResourceUsecase domain.ResourceUsecase
	store           domain.Datastore
	authorizer      domain.Authorizer
}

func NewResourceHandler(router *mux.Router, resourceUsecase domain.ResourceUsecase, store domain.Datastore) {
	handler := &ResourceHandler{
		ResourceUsecase: resourceUsecase,
		store:           store,
	}

	router.HandleFunc("/resources/{resourceID}", handler.GetResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}", handler.UpdateResource).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/ancestors", handler.GetAncestors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/children", handler.GetChildren).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources", handler.Search).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *ResourceHandler) GetResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if resource, err := hdlr.ResourceUsecase.GetResource(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, resource)
	}
}

func (hdlr *ResourceHandler) UpdateResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var patch usecases.ResourcePatch
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

		if err := hdlr.ResourceUsecase.MoveResource(r.Context(), id, newParentID); err != nil {
			writeError(w, err)
		} else {
			writeResponse(w, http.StatusNoContent, nil)
		}

		return
	}

	writeResponse(w, http.StatusBadRequest, nil)
}

func (hdlr *ResourceHandler) GetAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if ancestors, err := hdlr.ResourceUsecase.GetAncestors(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, ancestors)
	}
}

func (hdlr *ResourceHandler) GetChildren(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if children, err := hdlr.ResourceUsecase.GetChildren(r.Context(), id); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, children)
	}
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
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, results)
	}
}
