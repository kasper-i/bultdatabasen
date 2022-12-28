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

type CragHandler struct {
}

func NewCragHandler(router *mux.Router) {
	handler := &CragHandler{}

	router.HandleFunc("/resources/{resourceID}/crags", handler.GetCrags).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/crags", handler.CreateCrag).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", handler.GetCrag).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", handler.DeleteCrag).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *CragHandler) GetCrags(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if crags, err := sess.GetCrags(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, crags)
	}
}

func (hdlr *CragHandler) GetCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if crag, err := sess.GetCrag(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		crag.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, crag)
	}
}

func (hdlr *CragHandler) CreateCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var crag domain.Crag
	if err := json.Unmarshal(reqBody, &crag); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateCrag(r.Context(), &crag, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, crag)
	}
}

func (hdlr *CragHandler) DeleteCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteCrag(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
