package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/mux"
)

func GetRoutes(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if routes, err := sess.GetRoutes(parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, routes)
	}
}

func GetRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if route, err := sess.GetRoute(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		route.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, route)
	}
}

func CreateRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var route model.Route
	if err := json.Unmarshal(reqBody, &route); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateRoute(&route, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		route.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, route)
	}
}

func DeleteRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := sess.DeleteRoute(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func UpdateRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	routeID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var route model.Route

	if err := json.Unmarshal(reqBody, &route); err != nil {
		utils.WriteError(w, err)
		return
	}

	updatedRoute, err := sess.UpdateRoute(routeID, route)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, updatedRoute)
	}
}
