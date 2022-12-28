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

type BoltHandler struct {
}

func NewBoltHandler(router *mux.Router) {
	handler := &BoltHandler{}

	router.HandleFunc("/resources/{resourceID}/bolts", handler.GetBolts).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/bolts", handler.CreateBolt).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.GetBolt).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.UpdateBolt).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", handler.DeleteBolt).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *BoltHandler) GetBolts(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if bolts, err := sess.GetBolts(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, bolts)
	}
}

func (hdlr *BoltHandler) GetBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if bolt, err := sess.GetBolt(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		bolt.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, bolt)
	}
}

func (hdlr *BoltHandler) CreateBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var bolt domain.Bolt
	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateBolt(r.Context(), &bolt, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, bolt)
	}
}

func (hdlr *BoltHandler) DeleteBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteBolt(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *BoltHandler) UpdateBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	boltID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var bolt domain.Bolt

	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		utils.WriteError(w, err)
		return
	}

	updatedBolt, err := sess.UpdateBolt(r.Context(), boltID, bolt)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, updatedBolt)
	}
}
