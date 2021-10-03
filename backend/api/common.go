package api

import (
	"bultdatabasen/model"
	"net/http"
)

func createSession(r *http.Request) model.Session {
	userID := r.Context().Value("user_id").(string)
	return model.NewSession(model.DB, &userID)
}
