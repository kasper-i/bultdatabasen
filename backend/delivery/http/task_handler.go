package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/usecases"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type TaskHandler struct {
	TaskUsecase domain.TaskUsecase
}

func NewTaskHandler(router *mux.Router, taskUsecase domain.TaskUsecase) {
	handler := &TaskHandler{
		TaskUsecase: taskUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/tasks", handler.GetTasks).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/tasks", handler.CreateTask).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.GetTask).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.UpdateTask).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", handler.DeleteTask).Methods(http.MethodDelete, http.MethodOptions)
}

type GetTasksResponse struct {
	Data []domain.Task `json:"data"`
	Meta domain.Meta   `json:"meta"`
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

func (hdlr *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	query := r.URL.Query()
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	var pagination domain.Pagination
	if pagination, err = parsePaginationQuery(query); err != nil {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	if !pagination.Valid() {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	statuses := query["status"]

	if tasks, meta, err := hdlr.TaskUsecase.GetTasks(r.Context(), parentResourceID, pagination, statuses); err != nil {
		utils.WriteError(w, err)
	} else {
		response := GetTasksResponse{}
		response.Data = tasks
		response.Meta = meta
		utils.WriteResponse(w, http.StatusOK, response)
	}
}

func (hdlr *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if task, err := hdlr.TaskUsecase.GetTask(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		task.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, task)
	}
}

func (hdlr *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task domain.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	createdTask, err := hdlr.TaskUsecase.CreateTask(r.Context(), task, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, createdTask)
	}
}

func (hdlr *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var task domain.Task
	if err := json.Unmarshal(reqBody, &task); err != nil {
		utils.WriteError(w, err)
		return
	}

	updatedTask, err := hdlr.TaskUsecase.UpdateTask(r.Context(), task, taskID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		task.Ancestors = usecases.GetStoredAncestors(r)
		utils.WriteResponse(w, http.StatusOK, updatedTask)
	}
}

func (hdlr *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := hdlr.TaskUsecase.DeleteTask(r.Context(), resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
