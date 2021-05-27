package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"net/http"

	"github.com/gorilla/mux"
)

func GetAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if ancestors, err := model.GetAncestors(model.DB, id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, ancestors)
	}
}
