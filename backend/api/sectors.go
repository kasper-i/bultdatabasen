package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/mux"
)

func GetSectors(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if sectors, err := sess.GetSectors(parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, sectors)
	}
}

func GetSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if sector, err := sess.GetSector(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		sector.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, sector)
	}
}

func CreateSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var sector model.Sector
	if err := json.Unmarshal(reqBody, &sector); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateSector(&sector, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		sector.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, sector)
	}
}

func DeleteSector(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := sess.DeleteSector(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
