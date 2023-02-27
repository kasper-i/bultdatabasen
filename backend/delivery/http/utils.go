package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
)

type errorMessage struct {
	Status     int        `json:"status"`
	Message    string     `json:"message,omitempty"`
	ResourceID *uuid.UUID `json:"resourceId,omitempty"`
}

func writeResponse(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)

	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func writeError(w http.ResponseWriter, err error) {
	details := errorMessage{}

	var notFoundError *domain.ErrResourceNotFound
	var notAuthorizedError *domain.ErrNotAuthorized

	if errors.As(err, &notFoundError) {
		details.Status = http.StatusNotFound
		if notFoundError.ResourceID != uuid.Nil {
			details.ResourceID = &notFoundError.ResourceID
		}
	} else if errors.Is(err, domain.ErrNotAuthenticated) {
		details.Status = http.StatusUnauthorized
	} else if errors.As(err, &notAuthorizedError) {
		details.Status = http.StatusForbidden
		if notAuthorizedError.ResourceID != uuid.Nil {
			details.ResourceID = &notAuthorizedError.ResourceID
		}
	} else if errors.Is(err, domain.ErrUnsupportedMimeType) || errors.Is(err, domain.ErrNonOrthogonalAngle) || errors.Is(err, domain.ErrUnmovableResource) || errors.Is(err, domain.ErrIllegalParent) || errors.Is(err, domain.ErrVacantPoint) || errors.Is(err, domain.ErrBadInsertPosition) {
		details.Status = http.StatusBadRequest
	} else {
		details.Status = http.StatusInternalServerError
	}

	w.WriteHeader(details.Status)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(details)
}
