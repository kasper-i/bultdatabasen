package http

import (
	"bultdatabasen/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type MaterialHandler struct {
}

func NewMaterialHandler(router *mux.Router) {
	handler := &MaterialHandler{}

	router.HandleFunc("/materials", handler.GetMaterials).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *MaterialHandler) GetMaterials(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if materials, err := sess.GetMaterials(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, materials)
	}
}
