package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/gorm"
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

	var notFoundError *domain.ErrNotFound

	if errors.As(err, &notFoundError) {
		error.Status = http.StatusNotFound
		error.ResourceID = &notFoundError.ResourceID
	} else if errors.Is(err, gorm.ErrRecordNotFound) || errors.Is(err, utils.ErrNotFound) {
		error.Status = http.StatusNotFound
	} else if errors.Is(err, gorm.ErrInvalidData) {
		error.Status = http.StatusBadRequest
	} else if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1451 {
		error.Status = http.StatusConflict
		error.Message = "Conflict"
	} else if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
		error.Status = http.StatusConflict
		error.Message = "Duplicate entry"
	} else if errors.Is(err, utils.ErrLoopDetected) {
		error.Status = http.StatusConflict
		error.Message = err.Error()
	} else if errors.Is(err, utils.ErrMissingAttachmentPoint) || errors.Is(err, utils.ErrInvalidAttachmentPoint) || errors.Is(err, utils.ErrOrphanedResource) || errors.Is(err, utils.ErrHierarchyStructureViolation) || errors.Is(err, utils.ErrMoveNotPermitted) {
		error.Status = http.StatusBadRequest
		error.Message = err.Error()
	} else if errors.Is(err, utils.ErrCorruptResource) {
		error.Status = http.StatusInternalServerError
		error.Message = err.Error()
	} else if errors.Is(err, utils.ErrNotPermitted) {
		error.Status = http.StatusForbidden
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
