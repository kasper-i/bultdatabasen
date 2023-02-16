package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type boltHandler struct {
	boltUsecase domain.BoltUsecase
}

func NewBoltHandler(router *mux.Router, boltUsecase domain.BoltUsecase) {
	handler := &boltHandler{
		boltUsecase: boltUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/bolts", handler.GetBolts).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/bolts", handler.CreateBolt).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.GetBolt).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.UpdateBolt).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.DeleteBolt).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *boltHandler) GetBolts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if bolts, err := hdlr.boltUsecase.GetBolts(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, bolts)
	}
}

func (hdlr *boltHandler) GetBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if bolt, err := hdlr.boltUsecase.GetBolt(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, bolt)
	}
}

func (hdlr *boltHandler) CreateBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var bolt domain.Bolt
	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		writeError(w, err)
		return
	}

	createdBolt, err := hdlr.boltUsecase.CreateBolt(r.Context(), bolt, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdBolt)
	}
}

func (hdlr *boltHandler) DeleteBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.boltUsecase.DeleteBolt(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *boltHandler) UpdateBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	boltID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var bolt domain.Bolt

	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		writeError(w, err)
		return
	}

	updatedBolt, err := hdlr.boltUsecase.UpdateBolt(r.Context(), boltID, bolt)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, updatedBolt)
	}
}
