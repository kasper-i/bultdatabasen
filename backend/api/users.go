package api

import (
	"bultdatabasen/utils"
	"net/http"
)

func GetMyUser(w http.ResponseWriter, r *http.Request) {
	utils.WriteResponse(w, http.StatusOK, nil)
}
