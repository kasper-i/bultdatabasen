package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/mux"
)

type GetTasksResponse struct {
	Data []model.Task `json:"data"`
	Meta model.Meta   `json:"meta"`
}

func GetTasks(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]
	query := r.URL.Query()

	pagination := model.Pagination{}
	if err := pagination.ParseQuery(query); err != nil {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	if !pagination.Valid() {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	statuses := query["status"]

	if tasks, meta, err := sess.GetTasks(parentResourceId, pagination, statuses); err != nil {
		utils.WriteError(w, err)
	} else {
		response := GetTasksResponse{}
		response.Data = tasks
		response.Meta = meta
		utils.WriteResponse(w, http.StatusOK, response)
	}
}

func GetTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if task, err := sess.GetTask(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		task.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, task)
	}
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateTask(&task, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		task.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, task)
	}
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	taskID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.UpdateTask(&task, taskID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		task.WithAncestors(r)
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
