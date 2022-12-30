package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ManufacturerHandler struct {
	ManufacturerUsecase domain.ManufacturerUsecase
}

func NewManufacturerHandler(router *mux.Router, manufacturerUsecase domain.ManufacturerUsecase) {
	handler := &ManufacturerHandler{
		ManufacturerUsecase: manufacturerUsecase,
	}

	router.HandleFunc("/manufacturers", handler.GetManufacturers).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/manufacturers/{manufacturerID}/models", handler.GetModels).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *ManufacturerHandler) GetManufacturers(w http.ResponseWriter, r *http.Request) {
	if manufacturers, err := hdlr.ManufacturerUsecase.GetManufacturers(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, manufacturers)
	}
}

func (hdlr *ManufacturerHandler) GetModels(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	manufacturerID, err := uuid.Parse(vars["manufacturerID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if models, err := hdlr.ManufacturerUsecase.GetModels(r.Context(), manufacturerID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, models)
	}
}
