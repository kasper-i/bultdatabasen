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

func GetCrags(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if crags, err := sess.GetCrags(parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, crags)
	}
}

func GetCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if crag, err := sess.GetCrag(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		crag.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, crag)
	}
}

func CreateCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var crag model.Crag
	if err := json.Unmarshal(reqBody, &crag); err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.CreateCrag(&crag, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		crag.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, crag)
	}
}

func DeleteCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteCrag(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
