package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type RouteHandler struct {
}

func NewRouteHandler(router *mux.Router) {
	handler := &RouteHandler{}

	router.HandleFunc("/resources/{resourceID}/routes", handler.GetRoutes).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/routes", handler.CreateRoute).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.GetRoute).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.UpdateRoute).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.DeleteRoute).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *RouteHandler) GetRoutes(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if routes, err := sess.GetRoutes(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, routes)
	}
}

func (hdlr *RouteHandler) GetRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if route, err := sess.GetRoute(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		route.Ancestors = model.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, route)
	}
}

func (hdlr *RouteHandler) CreateRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var route domain.Route
	if err := json.Unmarshal(reqBody, &route); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateRoute(r.Context(), &route, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, route)
	}
}

func (hdlr *RouteHandler) DeleteRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteRoute(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *RouteHandler) UpdateRoute(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var route domain.Route

	if err := json.Unmarshal(reqBody, &route); err != nil {
		utils.WriteError(w, err)
		return
	}

	updatedRoute, err := sess.UpdateRoute(r.Context(), routeID, route)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, updatedRoute)
	}
}
