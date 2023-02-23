package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type areaHandler struct {
	areaUsecase domain.AreaUsecase
}

func NewAreaHandler(router *mux.Router, areaUsecase domain.AreaUsecase) {
	handler := &areaHandler{
		areaUsecase: areaUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/areas", handler.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas", handler.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/areas", handler.CreateArea).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/areas", handler.CreateArea).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", handler.GetArea).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", handler.DeleteArea).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *areaHandler) GetAreas(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(domain.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		writeError(w, err)
		return
	}

	if areas, err := hdlr.areaUsecase.GetAreas(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, areas)
	}
}

func (hdlr *areaHandler) GetArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if area, err := hdlr.areaUsecase.GetArea(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, area)
	}
}

func (hdlr *areaHandler) CreateArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(domain.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var area domain.Area
	if err := json.Unmarshal(reqBody, &area); err != nil {
		writeError(w, err)
		return
	}

	if createdArea, err := hdlr.areaUsecase.CreateArea(r.Context(), area, resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdArea)
	}
}

func (hdlr *areaHandler) DeleteArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.areaUsecase.DeleteArea(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
