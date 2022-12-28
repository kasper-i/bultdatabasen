package http

import (
	"bultdatabasen/utils"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ManufacturerHandler struct {
}

func NewManufacturerHandler(router *mux.Router) {
	handler := &ManufacturerHandler{}

	router.HandleFunc("/manufacturers", handler.GetManufacturers).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/manufacturers/{manufacturerID}/models", handler.GetModels).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *ManufacturerHandler) GetManufacturers(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if manufacturers, err := sess.GetManufacturers(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, manufacturers)
	}
}

func (hdlr *ManufacturerHandler) GetModels(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	manufacturerID, err := uuid.Parse(vars["manufacturerID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if models, err := sess.GetModels(r.Context(), manufacturerID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, models)
	}
}
