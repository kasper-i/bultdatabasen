package api

import (
	"bultdatabasen/model"
	"net/http"
)

func createSession(r *http.Request) model.Session {
	var userID *string

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = &value
	}

	return model.NewSession(model.DB, userID)
}

