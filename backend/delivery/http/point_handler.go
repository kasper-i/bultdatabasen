package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type PointHandler struct {
	PointUsecase domain.PointUsecase
}

func NewPointHandler(router *mux.Router, pointUsecase domain.PointUsecase) {
	handler := &PointHandler{
		PointUsecase: pointUsecase,
	}

	router.HandleFunc("/routes/{resourceID}/points", handler.GetPoints).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points", handler.AttachPoint).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points/{pointID}", handler.DetachPoint).Methods(http.MethodDelete, http.MethodOptions)
}

type CreatePointRequest struct {
	PointID  uuid.UUID              `json:"pointId"`
	Position *domain.InsertPosition `json:"position"`
	Anchor   bool                   `json:"anchor"`
	Bolts    []domain.Bolt          `json:"bolts"`
}

func (hdlr *PointHandler) GetPoints(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if points, err := hdlr.PointUsecase.GetPoints(r.Context(), routeID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, points)
	}
}

func (hdlr *PointHandler) AttachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var request CreatePointRequest
	if err := json.Unmarshal(reqBody, &request); err != nil {
		writeError(w, err)
		return
	}

	point, err := hdlr.PointUsecase.AttachPoint(r.Context(), routeID, request.PointID, request.Position, request.Anchor, request.Bolts)

	if err != nil {
		writeError(w, err)
	} else {
		var status int

		if request.PointID == uuid.Nil {
			status = http.StatusCreated
		} else {
			status = http.StatusOK
		}

		writeResponse(w, status, point)
	}
}

func (hdlr *PointHandler) DetachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	pointID, err := uuid.Parse(vars["pointID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.PointUsecase.DetachPoint(r.Context(), routeID, pointID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
