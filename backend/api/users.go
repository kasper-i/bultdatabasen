package api

import (
	"bultdatabasen/domain"
	"bultdatabasen/utils"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"gorm.io/gorm"
)

func GetUserNames(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)

	if names, err := sess.GetUserNames(); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, names)
	}

}

func GetMyself(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userID := r.Context().Value("user_id").(string)

	if user, err := sess.GetUser(userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = &domain.User{
				ID:        userID,
				FirstSeen: time.Now(),
			}

			if err := sess.CreateUser(user); err != nil {
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

func UpdateMyself(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userID := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var desiredUser domain.User
	if err := json.Unmarshal(reqBody, &desiredUser); err != nil {
		utils.WriteError(w, err)
		return
	}

	if user, err := sess.GetUser(userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = &domain.User{
				ID:        userID,
				FirstName: desiredUser.FirstName,
				LastName:  desiredUser.LastName,
				FirstSeen: time.Now(),
			}

			if err := sess.CreateUser(user); err != nil {
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

		err := sess.UpdateUser(user)

		if err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusOK, user)
		}
	}
}
