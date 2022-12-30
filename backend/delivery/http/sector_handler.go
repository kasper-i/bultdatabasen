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

type SectorHandler struct {
	SectorUsecase domain.SectorUsecase
}

func NewSectorHandler(router *mux.Router, sectorUsecase domain.SectorUsecase) {
	handler := &SectorHandler{
		SectorUsecase: sectorUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/sectors", handler.GetSectors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/sectors", handler.CreateSector).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.GetSector).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", handler.DeleteSector).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *SectorHandler) GetSectors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if sectors, err := hdlr.SectorUsecase.GetSectors(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, sectors)
	}
}

func (hdlr *SectorHandler) GetSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if sector, err := hdlr.SectorUsecase.GetSector(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		sector.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, sector)
	}
}

func (hdlr *SectorHandler) CreateSector(w http.ResponseWriter, r *http.Request) {
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

	createdSector, err := hdlr.SectorUsecase.CreateSector(r.Context(), sector, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, createdSector)
	}
}

func (hdlr *SectorHandler) DeleteSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := hdlr.SectorUsecase.DeleteSector(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
