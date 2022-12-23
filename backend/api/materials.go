package api

import (
	"bultdatabasen/utils"
	"net/http"
)

func GetMaterials(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if materials, err := sess.GetMaterials(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, materials)
	}
}
