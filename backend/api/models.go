package api

import (
	"bultdatabasen/utils"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetModels(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	manufacturerID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if models, err := sess.GetModels(manufacturerID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, models)
	}
}
