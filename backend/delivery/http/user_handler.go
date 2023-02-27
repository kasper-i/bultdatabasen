package http

import (
	"bultdatabasen/domain"
	"net/http"

	"github.com/gorilla/mux"
)

type userHandler struct {
	userUsecase domain.UserUsecase
}

func NewUserHandler(router *mux.Router, userUsecase domain.UserUsecase) {
	handler := &userHandler{
		userUsecase: userUsecase,
	}

	router.HandleFunc("/users", handler.GetUsers).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/roles", handler.GetUserRoles).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams/{teamID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *userHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	if names, err := hdlr.userUsecase.GetUsers(r.Context()); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, names)
	}
}

func (hdlr *userHandler) GetUserRoles(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userID"]

	if roles, err := hdlr.userUsecase.GetUserRoles(r.Context(), userID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, roles)
	}
}
