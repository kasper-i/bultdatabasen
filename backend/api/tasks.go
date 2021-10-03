package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetTasks(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if tasks, err := sess.GetTasks(parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, tasks)
	}
}

func GetTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if task, err := sess.GetTask(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, task)
	}
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateTask(&task, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, task)
	}
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	taskID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.UpdateTask(&task, taskID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, task)
	}
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := sess.DeleteTask(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
