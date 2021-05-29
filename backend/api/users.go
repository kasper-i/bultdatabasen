package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"net/http"
)

func GetMyUser(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("user_id").(string)

	if user, err := model.GetUser(model.DB, userId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, user)
	}
}
