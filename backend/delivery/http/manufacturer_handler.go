package http

import (
	"bultdatabasen/domain"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type manufacturerHandler struct {
	manufacturerUsecase domain.ManufacturerUsecase
}

func NewManufacturerHandler(router *mux.Router, manufacturerUsecase domain.ManufacturerUsecase) {
	handler := &manufacturerHandler{
		manufacturerUsecase: manufacturerUsecase,
	}

	router.HandleFunc("/manufacturers", handler.GetManufacturers).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/manufacturers/{manufacturerID}/models", handler.GetModels).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *manufacturerHandler) GetManufacturers(w http.ResponseWriter, r *http.Request) {
	if manufacturers, err := hdlr.manufacturerUsecase.GetManufacturers(r.Context()); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, manufacturers)
	}
}

func (hdlr *manufacturerHandler) GetModels(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	manufacturerID, err := uuid.Parse(vars["manufacturerID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if models, err := hdlr.manufacturerUsecase.GetModels(r.Context(), manufacturerID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, models)
	}
}
