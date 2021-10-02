package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

type CreatePointRequest struct {
	PointID  *string               `json:"pointId"`
	Position *model.InsertPosition `json:"position"`
}

func GetPoints(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID := vars["resourceID"]

	if resource, err := model.GetResource(model.DB, routeID); err != nil {
		utils.WriteError(w, err)
		return
	} else if resource.Type != "route" {
		utils.WriteResponse(w, http.StatusMethodNotAllowed, nil)
		return
	}

	if points, err := model.GetPoints(model.DB, routeID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, points)
	}
}

func AttachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
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

	point, err := model.AttachPoint(model.DB, routeID, request.PointID, request.Position)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		if request.PointID == nil {
			utils.WriteResponse(w, http.StatusCreated, point)
		} else {
			utils.WriteResponse(w, http.StatusOK, point)
		}
	}
}

func DetachPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID := vars["resourceID"]
	pointID := vars["pointID"]

	if err := model.DetachPoint(model.DB, routeID, pointID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
