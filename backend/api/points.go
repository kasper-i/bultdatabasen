package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetPoints(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if resource, err := model.GetResource(model.DB, parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else if (resource.Type != "route") {
		utils.WriteResponse(w, http.StatusMethodNotAllowed, nil)
		return
	}

	if points, err := model.GetPoints(model.DB, parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, points)
	}
}

func CreatePoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var point model.Point
	json.Unmarshal(reqBody, &point)

	err := model.CreatePoint(model.DB, &point, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, point)
	}
}
