package api

import (
	"bultdatabasen/utils"
	"net/http"

	"github.com/gorilla/mux"
)

func GetModels(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	manufacturerID := vars["manufacturerID"]

	if models, err := sess.GetModels(manufacturerID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, models)
	}
}
