package http

import (
	"bultdatabasen/domain"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type commentHandler struct {
	commentUsecase domain.CommentUsecase
}

func NewCommentHandler(router *mux.Router, commentUsecase domain.CommentUsecase) {
	handler := &commentHandler{
		commentUsecase: commentUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/comments", handler.GetComments).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/comments", handler.CreateComment).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/comments/{resourceID}", handler.GetComment).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/comments/{resourceID}", handler.UpdateComment).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/comments/{resourceID}", handler.DeleteComment).Methods(http.MethodDelete, http.MethodOptions)
}

func (hdlr *commentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if comments, err := hdlr.commentUsecase.GetComments(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, comments)
	}
}

func (hdlr *commentHandler) GetComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if comment, err := hdlr.commentUsecase.GetComment(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, comment)
	}
}

func (hdlr *commentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var comment domain.Comment
	if err := json.Unmarshal(reqBody, &comment); err != nil {
		writeError(w, err)
		return
	}

	createdComment, err := hdlr.commentUsecase.CreateComment(r.Context(), comment, parentResourceID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, createdComment)
	}
}

func (hdlr *commentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if err := hdlr.commentUsecase.DeleteComment(r.Context(), resourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *commentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commentID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var comment domain.Comment

	if err := json.Unmarshal(reqBody, &comment); err != nil {
		writeError(w, err)
		return
	}

	updatedComment, err := hdlr.commentUsecase.UpdateComment(r.Context(), commentID, comment)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, updatedComment)
	}
}
