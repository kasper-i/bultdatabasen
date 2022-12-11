package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type GetTasksResponse struct {
	Data []model.Task `json:"data"`
	Meta model.Meta   `json:"meta"`
}

func GetTasks(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	query := r.URL.Query()
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

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

	if tasks, meta, err := sess.GetTasks(parentResourceID, pagination, statuses); err != nil {
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
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if task, err := sess.GetTask(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		task.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, task)
	}
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateTask(&task, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, task)
	}
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	taskID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task model.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.UpdateTask(&task, taskID)

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
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteTask(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
