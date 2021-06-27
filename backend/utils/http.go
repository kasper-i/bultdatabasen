package utils

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

type Error struct {
	Status     int     `json:"status"`
	Message    string  `json:"message"`
	ResourceID *string `json:"resourceId,omitempty"`
}

func WriteResponse(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)

	if payload != nil {
		json.NewEncoder(w).Encode(payload)
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
	} else if errors.Is(err, ErrIllegalChildResource) {
		status = http.StatusConflict
		error.Message = "Illegal child"
	} else if errors.Is(err, ErrIllegalParentResource) {
		status = http.StatusConflict
		error.Message = "Illegal parent"
	} else {
		status = http.StatusInternalServerError
	}

	error.Status = status

	w.WriteHeader(status)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(error)
}
