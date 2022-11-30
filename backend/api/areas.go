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

func GetAreas(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)

	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(model.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		utils.WriteError(w, err)
		return
	}

	if areas, err := sess.GetAreas(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, areas)
	}
}

func GetArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if area, err := sess.GetArea(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		area.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, area)
	}
}

func CreateArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	var resourceID uuid.UUID
	var err error

	if vars["resourceID"] == "" {
		resourceID, _ = uuid.Parse(model.RootID)
	} else if resourceID, err = uuid.Parse(vars["resourceID"]); err != nil {
		utils.WriteError(w, err)
		return
	}

	userId := r.Context().Value("user_id").(string)

	reqBody, _ := io.ReadAll(r.Body)
	var area model.Area
	if err := json.Unmarshal(reqBody, &area); err != nil {
		utils.WriteError(w, err)
		return
	}

	if err = sess.CreateArea(&area, resourceID, userId); err != nil {
		utils.WriteError(w, err)
	} else {
		area.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, area)
	}
}

func DeleteArea(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if err := sess.DeleteArea(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
