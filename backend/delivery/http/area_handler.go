package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/usecases"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type AreaHandler struct {
}

func NewAreaHandler(router *mux.Router) {
	handler := &AreaHandler{}

	router.HandleFunc("/resources/{resourceID}/areas", handler.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas", handler.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/areas", handler.CreateArea).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/areas", handler.CreateArea).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", handler.GetArea).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", handler.DeleteArea).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *AreaHandler) GetAreas(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)

	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(domain.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		utils.WriteError(w, err)
		return
	}

	if areas, err := sess.GetAreas(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, areas)
	}
}

func (hdlr *AreaHandler) GetArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if area, err := sess.GetArea(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		area.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, area)
	}
}

func (hdlr *AreaHandler) CreateArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(domain.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		utils.WriteError(w, err)
		return
	}

	userId := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var area domain.Area
	if err := json.Unmarshal(reqBody, &area); err != nil {
		utils.WriteError(w, err)
		return
	}

	if err = sess.CreateArea(r.Context(), &area, resourceID, userId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, area)
	}
}

func (hdlr *AreaHandler) DeleteArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteArea(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
