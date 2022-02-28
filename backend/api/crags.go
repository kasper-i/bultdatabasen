package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetCrags(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if crags, err := sess.GetCrags(parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, crags)
	}
}

func GetCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if crag, err := sess.GetCrag(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		crag.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, crag)
	}
}

func CreateCrag(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var crag model.Crag
	if err := json.Unmarshal(reqBody, &crag); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateCrag(&crag, parentResourceID)

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
	resourceId := vars["resourceID"]

	if err := sess.DeleteCrag(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
