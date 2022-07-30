package api

import (
	"bultdatabasen/utils"
	"net/http"
)

func GetManufacturers(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if manufacturers, err := sess.GetManufacturers(); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, manufacturers)
	}
}
