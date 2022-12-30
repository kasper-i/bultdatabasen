package usecases

import (
	"bultdatabasen/domain"
	"net/http"
)

func GetStoredAncestors(r *http.Request) []domain.Resource {
	if value, ok := r.Context().Value("ancestors").([]domain.Resource); ok {
		return value
	}

	return nil
}
