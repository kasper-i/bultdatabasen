package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type sectorHandler struct {
	sectorUsecase domain.SectorUsecase
}

func NewSectorHandler(router *mux.Router, sectorUsecase domain.SectorUsecase) {
	handler := &sectorHandler{
		sectorUsecase: sectorUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/sectors", handler.GetSectors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/sectors", handler.CreateSector).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.GetSector).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.DeleteSector).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *sectorHandler) GetSectors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if sectors, err := hdlr.sectorUsecase.GetSectors(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, sectors)
	}
}

func (hdlr *sectorHandler) GetSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if sector, err := hdlr.sectorUsecase.GetSector(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, sector)
	}
}

func (hdlr *sectorHandler) CreateSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var sector domain.Sector
	if err := json.Unmarshal(reqBody, &sector); err != nil {
		writeError(w, err)
		return
	}

	createdSector, err := hdlr.sectorUsecase.CreateSector(r.Context(), sector, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdSector)
	}
}

func (hdlr *sectorHandler) DeleteSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.sectorUsecase.DeleteSector(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
