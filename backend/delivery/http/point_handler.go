package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type PointHandler struct {
	PointUsecase    domain.PointUsecase
	ResourceUsecase domain.ResourceUsecase
}

func NewPointHandler(router *mux.Router, pointUsecase domain.PointUsecase, resourceUsecase domain.ResourceUsecase) {
	handler := &PointHandler{
		PointUsecase:    pointUsecase,
		ResourceUsecase: resourceUsecase,
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
		utils.WriteError(w, err)
		return
	}

	if resource, err := hdlr.ResourceUsecase.GetResource(r.Context(), routeID); err != nil {
		utils.WriteError(w, err)
		return
	} else if resource.Type != domain.TypeRoute {
		utils.WriteResponse(w, http.StatusMethodNotAllowed, nil)
		return
	}

	if points, err := hdlr.PointUsecase.GetPoints(r.Context(), routeID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, points)
	}
}

func (hdlr *PointHandler) AttachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var request CreatePointRequest
	if err := json.Unmarshal(reqBody, &request); err != nil {
		utils.WriteError(w, err)
		return
	}

	if request.Position != nil {
		order := request.Position.Order
		if order != "before" && order != "after" {
			utils.WriteResponse(w, http.StatusBadRequest, nil)
			return
		}
	}

	if request.PointID == uuid.Nil && len(request.Bolts) == 0 {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	point, err := hdlr.PointUsecase.AttachPoint(r.Context(), routeID, request.PointID, request.Position, request.Anchor, request.Bolts)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		var status int

		if request.PointID == uuid.Nil {
			status = http.StatusCreated
		} else {
			status = http.StatusOK
		}

		utils.WriteResponse(w, status, point)
	}
}

func (hdlr *PointHandler) DetachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	pointID, err := uuid.Parse(vars["pointID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := hdlr.PointUsecase.DetachPoint(r.Context(), routeID, pointID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
