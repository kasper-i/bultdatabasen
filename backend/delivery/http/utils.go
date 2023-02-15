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
	Message    string     `json:"message"`
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
	error := errorMessage{}

	var notFoundError *domain.ErrResourceNotFound
	var notAuthorizedError *domain.ErrNotAuthorized

	if errors.As(err, &notFoundError) {
		error.Status = http.StatusNotFound
		error.ResourceID = &notFoundError.ResourceID
	} else if errors.Is(err, domain.ErrNotAuthenticated) {
		error.Status = http.StatusUnauthorized
	} else if errors.As(err, &notAuthorizedError) {
		error.Status = http.StatusForbidden
		error.ResourceID = &notAuthorizedError.ResourceID
	} else if errors.Is(err, domain.ErrUnsupportedMimeType) || errors.Is(err, domain.ErrNonOrthogonalAngle) || errors.Is(err, domain.ErrUnmovableResource) || errors.Is(err, domain.ErrIllegalParent) || errors.Is(err, domain.ErrVacantPoint) || errors.Is(err, domain.ErrBadInsertPosition) {
		error.Status = http.StatusBadRequest
	} else {
		error.Status = http.StatusInternalServerError
	}

	w.WriteHeader(error.Status)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(error)
}

func writeUnauthorized(w http.ResponseWriter) {
	err := errorMessage{
		Status:  http.StatusUnauthorized,
		Message: "Unauthorized",
	}

	w.WriteHeader(http.StatusUnauthorized)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(err)
}

func writeForbidden(w http.ResponseWriter, resourceID *uuid.UUID) {
	err := errorMessage{
		Status:     http.StatusForbidden,
		Message:    "Forbidden",
		ResourceID: resourceID,
	}

	w.WriteHeader(http.StatusForbidden)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(err)
}
