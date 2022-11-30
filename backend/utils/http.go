package utils

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Error struct {
	Status     int        `json:"status"`
	Message    string     `json:"message"`
	ResourceID *uuid.UUID `json:"resourceId,omitempty"`
}

func WriteResponse(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)

	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func WriteError(w http.ResponseWriter, err error) {
	error := Error{}
	var status int

	if errors.Is(err, gorm.ErrRecordNotFound) {
		status = http.StatusNotFound
	} else if errors.Is(err, gorm.ErrInvalidData) {
		status = http.StatusBadRequest
	} else if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1451 {
		status = http.StatusConflict
		error.Message = "Conflict"
	} else if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
		status = http.StatusConflict
		error.Message = "Duplicate entry"
	} else if errors.Is(err, ErrLoopDetected) {
		status = http.StatusConflict
		error.Message = err.Error()
	} else if errors.Is(err, ErrMissingAttachmentPoint) || errors.Is(err, ErrInvalidAttachmentPoint) || errors.Is(err, ErrOrphanedResource) || errors.Is(err, ErrHierarchyStructureViolation) || errors.Is(err, ErrMoveNotPermitted) {
		status = http.StatusBadRequest
		error.Message = err.Error()
	} else if errors.Is(err, ErrCorruptResource) {
		status = http.StatusInternalServerError
		error.Message = err.Error()
	} else if errors.Is(err, ErrNotPermitted) {
		status = http.StatusForbidden
	} else {
		status = http.StatusInternalServerError
	}

	error.Status = status

	w.WriteHeader(status)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(error)
}
