package http

import (
	"bultdatabasen/usecases"
	"net/http"
)

func createSession(r *http.Request) usecases.Session {
	var userID *string

	if value, ok := r.Context().Value("user_id").(string); ok {
		userID = &value
	}

	return usecases.NewSession(usecases.DB, userID)
}
