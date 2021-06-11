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
		for i, j := 0, len(ancestors)-1; i < j; i, j = i+1, j-1 {
			ancestors[i], ancestors[j] = ancestors[j], ancestors[i]
		}
		
		utils.WriteResponse(w, http.StatusOK, ancestors)
	}
}
