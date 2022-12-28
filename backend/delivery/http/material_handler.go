package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type materialHandler struct {
	MUsecase domain.MaterialUsecase
}

func NewMaterialHandler(router *mux.Router, materialUsecase domain.MaterialUsecase) {
	handler := &materialHandler{
		MUsecase: materialUsecase,
	}

	router.HandleFunc("/materials", handler.GetMaterials).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *materialHandler) GetMaterials(w http.ResponseWriter, r *http.Request) {

	if materials, err := hdlr.MUsecase.GetMaterials(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, materials)
	}
}
