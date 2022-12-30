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
	UserUsecase domain.UserUsecase
}

func NewUserHandler(router *mux.Router, userUsecase domain.UserUsecase) {
	handler := &UserHandler{
		UserUsecase: userUsecase,
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

func (hdlr *UserHandler) GetUserNames(w http.ResponseWriter, r *http.Request) {
	if names, err := hdlr.UserUsecase.GetUserNames(r.Context()); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, names)
	}

}

func (hdlr *UserHandler) GetMyself(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	if user, err := hdlr.UserUsecase.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = domain.User{
				ID:        userID,
				FirstSeen: time.Now(),
			}

			if createdUser, err := hdlr.UserUsecase.CreateUser(r.Context(), user); err != nil {
				utils.WriteError(w, err)
				return
			} else {
				utils.WriteResponse(w, http.StatusOK, createdUser)
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
	userID := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var desiredUser domain.User
	if err := json.Unmarshal(reqBody, &desiredUser); err != nil {
		utils.WriteError(w, err)
		return
	}

	if user, err := hdlr.UserUsecase.GetUser(r.Context(), userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = domain.User{
				ID:        userID,
				FirstName: desiredUser.FirstName,
				LastName:  desiredUser.LastName,
				FirstSeen: time.Now(),
			}

			if createdUser, err := hdlr.UserUsecase.CreateUser(r.Context(), user); err != nil {
				utils.WriteError(w, err)
				return
			} else {
				utils.WriteResponse(w, http.StatusCreated, createdUser)
				return
			}
		} else {
			utils.WriteError(w, err)
			return
		}
	} else {
		user.FirstName = desiredUser.FirstName
		user.LastName = desiredUser.LastName

		updatedUser, err := hdlr.UserUsecase.UpdateUser(r.Context(), user)

		if err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusOK, updatedUser)
		}
	}
}
