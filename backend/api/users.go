package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"time"

	"gorm.io/gorm"
)

func GetMyUser(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userId := r.Context().Value("user_id").(string)

	if user, err := sess.GetUser(userId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, user)
	}
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	userId := r.Context().Value("user_id").(string)

	reqBody, _ := ioutil.ReadAll(r.Body)
	var desiredUser model.User
	if err := json.Unmarshal(reqBody, &desiredUser); err != nil {
		utils.WriteError(w, err)
		return
	}

	if user, err := sess.GetUser(userId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user = &model.User{
				ID:       userId,
				Name:     desiredUser.Name,
				JoinDate: time.Now(),
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
		user.Name = desiredUser.Name

		err := sess.UpdateUser(user)

		if err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusOK, user)
		}
	}
}
