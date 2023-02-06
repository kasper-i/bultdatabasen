package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type materialHandler struct {
	MaterialUsecase domain.MaterialUsecase
}

func NewMaterialHandler(router *mux.Router, materialUsecase domain.MaterialUsecase) {
	handler := &materialHandler{
		MaterialUsecase: materialUsecase,
	}

	router.HandleFunc("/materials", handler.GetMaterials).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *materialHandler) GetMaterials(w http.ResponseWriter, r *http.Request) {
	if materials, err := hdlr.MaterialUsecase.GetMaterials(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, materials)
	}
}
