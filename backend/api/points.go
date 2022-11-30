package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CreatePointRequest struct {
	PointID  uuid.UUID             `json:"pointId"`
	Position *model.InsertPosition `json:"position"`
	Anchor   bool                  `json:"anchor"`
	Bolts    []model.Bolt          `json:"bolts"`
}

func GetPoints(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if resource, err := sess.GetResource(routeID); err != nil {
		utils.WriteError(w, err)
		return
	} else if resource.Type != model.TypeRoute {
		utils.WriteResponse(w, http.StatusMethodNotAllowed, nil)
		return
	}

	if points, err := sess.GetPoints(routeID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, points)
	}
}

func AttachPoint(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
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

	point, err := sess.AttachPoint(routeID, request.PointID, request.Position, request.Anchor, request.Bolts)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		var status int

		if request.PointID == uuid.Nil {
			status = http.StatusCreated
		} else {
			status = http.StatusOK
		}

		point.WithAncestors(r)
		utils.WriteResponse(w, status, point)
	}
}

func DetachPoint(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
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

	if err := sess.DetachPoint(routeID, pointID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
