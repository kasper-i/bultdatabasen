package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type cragHandler struct {
	cragUsecase domain.CragUsecase
}

func NewCragHandler(router *mux.Router, cragUsecase domain.CragUsecase) {
	handler := &cragHandler{
		cragUsecase: cragUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/crags", handler.GetCrags).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/crags", handler.CreateCrag).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", handler.GetCrag).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", handler.DeleteCrag).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *cragHandler) GetCrags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if crags, err := hdlr.cragUsecase.GetCrags(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, crags)
	}
}

func (hdlr *cragHandler) GetCrag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if crag, err := hdlr.cragUsecase.GetCrag(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, crag)
	}
}

func (hdlr *cragHandler) CreateCrag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var crag domain.Crag
	if err := json.Unmarshal(reqBody, &crag); err != nil {
		writeError(w, err)
		return
	}

	createdCrag, err := hdlr.cragUsecase.CreateCrag(r.Context(), crag, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdCrag)
	}
}

func (hdlr *cragHandler) DeleteCrag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.cragUsecase.DeleteCrag(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
