package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type UserHandler struct {
}

func NewUserHandler(router *mux.Router) {
	handler := &UserHandler{}

	router.HandleFunc("/users/names", handler.GetUserNames).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/myself", handler.GetMyself).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/myself", handler.UpdateMyself).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams/{teamID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *UserHandler) GetUserNames(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if names, err := sess.GetUserNames(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, names)
	}

}

func (hdlr *UserHandler) GetMyself(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userID := r.Context().Value("user_id").(string)

	if user, err := sess.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = &domain.User{
				ID:        userID,
				FirstSeen: time.Now(),
			}

			if err := sess.CreateUser(r.Context(), user); err != nil {
				utils.WriteError(w, err)
				return
			} else {
				utils.WriteResponse(w, http.StatusOK, user)
				return
			}
		} else {
			utils.WriteError(w, err)
			return
		}
	} else {
		utils.WriteResponse(w, http.StatusOK, user)
	}
}

func (hdlr *UserHandler) UpdateMyself(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userID := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var desiredUser domain.User
	if err := json.Unmarshal(reqBody, &desiredUser); err != nil {
		utils.WriteError(w, err)
		return
	}

	if user, err := sess.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = &domain.User{
				ID:        userID,
				FirstName: desiredUser.FirstName,
				LastName:  desiredUser.LastName,
				FirstSeen: time.Now(),
			}

			if err := sess.CreateUser(r.Context(), user); err != nil {
				utils.WriteError(w, err)
				return
			} else {
				utils.WriteResponse(w, http.StatusCreated, user)
				return
			}
		} else {
			utils.WriteError(w, err)
			return
		}
	} else {
		user.FirstName = desiredUser.FirstName
		user.LastName = desiredUser.LastName

		err := sess.UpdateUser(r.Context(), user)

		if err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusOK, user)
		}
	}
}
