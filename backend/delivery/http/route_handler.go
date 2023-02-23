package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type routeHandler struct {
	routeUsecase domain.RouteUsecase
}

func NewRouteHandler(router *mux.Router, routeUsecase domain.RouteUsecase) {
	handler := &routeHandler{
		routeUsecase: routeUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/routes", handler.GetRoutes).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/routes", handler.CreateRoute).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.GetRoute).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.UpdateRoute).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", handler.DeleteRoute).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *routeHandler) GetRoutes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if routes, err := hdlr.routeUsecase.GetRoutes(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, routes)
	}
}

func (hdlr *routeHandler) GetRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if route, err := hdlr.routeUsecase.GetRoute(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, route)
	}
}

func (hdlr *routeHandler) CreateRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var route domain.Route
	if err := json.Unmarshal(reqBody, &route); err != nil {
		writeError(w, err)
		return
	}

	createdRoute, err := hdlr.routeUsecase.CreateRoute(r.Context(), route, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdRoute)
	}
}

func (hdlr *routeHandler) DeleteRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.routeUsecase.DeleteRoute(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *routeHandler) UpdateRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	routeID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var route domain.Route

	if err := json.Unmarshal(reqBody, &route); err != nil {
		writeError(w, err)
		return
	}

	updatedRoute, err := hdlr.routeUsecase.UpdateRoute(r.Context(), routeID, route)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, updatedRoute)
	}
}
