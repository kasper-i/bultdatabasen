package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type userHandler struct {
	userUsecase domain.UserUsecase
}

func NewUserHandler(router *mux.Router, userUsecase domain.UserUsecase) {
	handler := &userHandler{
		userUsecase: userUsecase,
	}

	router.HandleFunc("/users/names", handler.GetUserNames).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/myself", handler.GetMyself).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/myself", handler.UpdateMyself).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams/{teamID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *userHandler) GetUserNames(w http.ResponseWriter, r *http.Request) {
	if names, err := hdlr.userUsecase.GetUserNames(r.Context()); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, names)
	}

}

func (hdlr *userHandler) GetMyself(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	if user, err := hdlr.userUsecase.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = domain.User{
				ID:        userID,
				FirstSeen: time.Now(),
			}

			if createdUser, err := hdlr.userUsecase.CreateUser(r.Context(), user); err != nil {
				writeError(w, err)
				return
			} else {
				writeResponse(w, http.StatusOK, createdUser)
				return
			}
		} else {
			writeError(w, err)
			return
		}
	} else {
		writeResponse(w, http.StatusOK, user)
	}
}

func (hdlr *userHandler) UpdateMyself(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var desiredUser domain.User
	if err := json.Unmarshal(reqBody, &desiredUser); err != nil {
		writeError(w, err)
		return
	}

	if user, err := hdlr.userUsecase.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = domain.User{
				ID:        userID,
				FirstName: desiredUser.FirstName,
				LastName:  desiredUser.LastName,
				FirstSeen: time.Now(),
			}

			if createdUser, err := hdlr.userUsecase.CreateUser(r.Context(), user); err != nil {
				writeError(w, err)
				return
			} else {
				writeResponse(w, http.StatusCreated, createdUser)
				return
			}
		} else {
			writeError(w, err)
			return
		}
	} else {
		user.FirstName = desiredUser.FirstName
		user.LastName = desiredUser.LastName

		updatedUser, err := hdlr.userUsecase.UpdateUser(r.Context(), user)

		if err != nil {
			writeError(w, err)
		} else {
			writeResponse(w, http.StatusOK, updatedUser)
		}
	}
}
