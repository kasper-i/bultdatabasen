package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetRoutes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if routes, err := model.GetRoutes(model.DB, parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, routes)
	}
}

func GetRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if route, err := model.GetRoute(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, route)
	}
}

func CreateRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var route model.Route
	if err := json.Unmarshal(reqBody, &route); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := model.CreateRoute(model.DB, &route, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, route)
	}
}

func DeleteRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := model.DeleteRoute(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
