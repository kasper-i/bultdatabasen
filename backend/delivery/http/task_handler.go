package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type taskHandler struct {
	taskUsecase domain.TaskUsecase
}

func NewTaskHandler(router *mux.Router, taskUsecase domain.TaskUsecase) {
	handler := &taskHandler{
		taskUsecase: taskUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/tasks", handler.GetTasks).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/tasks", handler.CreateTask).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.GetTask).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.UpdateTask).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.DeleteTask).Methods(http.MethodDelete, http.MethodOptions)
}

func parsePaginationQuery(query url.Values) (domain.Pagination, error) {
	var pagination domain.Pagination

	if page, err := strconv.Atoi(query.Get("page")); err == nil {
		pagination.Page = page
	} else {
		return pagination, err
	}

	if itemsPerPage, err := strconv.Atoi(query.Get("itemsPerPage")); err == nil {
		pagination.ItemsPerPage = itemsPerPage
	} else {
		return pagination, err
	}

	return pagination, nil
}

func (hdlr *taskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	query := r.URL.Query()
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	var pagination domain.Pagination
	if pagination, err = parsePaginationQuery(query); err != nil {
		writeResponse(w, http.StatusBadRequest, nil)
		return
	}

	statuses := query["status"]

	if page, err := hdlr.taskUsecase.GetTasks(r.Context(), parentResourceID, pagination, statuses); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, page)
	}
}

func (hdlr *taskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if task, err := hdlr.taskUsecase.GetTask(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, task)
	}
}

func (hdlr *taskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task domain.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		writeError(w, err)
		return
	}

	createdTask, err := hdlr.taskUsecase.CreateTask(r.Context(), task, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdTask)
	}
}

func (hdlr *taskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task domain.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		writeError(w, err)
		return
	}

	updatedTask, err := hdlr.taskUsecase.UpdateTask(r.Context(), taskID, task)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, updatedTask)
	}
}

func (hdlr *taskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.taskUsecase.DeleteTask(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
