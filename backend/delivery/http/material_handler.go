package http

import (
	"bultdatabasen/domain"
	"net/http"

	"github.com/gorilla/mux"
)

type materialHandler struct {
	materialUsecase domain.MaterialUsecase
}

func NewMaterialHandler(router *mux.Router, materialUsecase domain.MaterialUsecase) {
	handler := &materialHandler{
		materialUsecase: materialUsecase,
	}

	router.HandleFunc("/materials", handler.GetMaterials).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *materialHandler) GetMaterials(w http.ResponseWriter, r *http.Request) {
	if materials, err := hdlr.materialUsecase.GetMaterials(r.Context()); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, materials)
	}
}
