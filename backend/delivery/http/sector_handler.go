package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type SectorHandler struct {
}

func NewSectorHandler(router *mux.Router) {
	handler := &SectorHandler{}

	router.HandleFunc("/resources/{resourceID}/sectors", handler.GetSectors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/sectors", handler.CreateSector).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.GetSector).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.DeleteSector).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *SectorHandler) GetSectors(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if sectors, err := sess.GetSectors(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, sectors)
	}
}

func (hdlr *SectorHandler) GetSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if sector, err := sess.GetSector(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		sector.Ancestors = model.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, sector)
	}
}

func (hdlr *SectorHandler) CreateSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var sector domain.Sector
	if err := json.Unmarshal(reqBody, &sector); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateSector(r.Context(), &sector, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, sector)
	}
}

func (hdlr *SectorHandler) DeleteSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteSector(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
