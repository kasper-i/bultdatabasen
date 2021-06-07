package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetAreas(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]
	if resourceId == "" {
		resourceId = model.RootID
	}

	if areas, err := model.GetAreas(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, areas)
	}
}

func GetArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if area, err := model.GetArea(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, area)
	}
}

func CreateArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]
	if resourceId == "" {
		resourceId = model.RootID
	}

	userId := r.Context().Value("user_id").(string)

	reqBody, _ := ioutil.ReadAll(r.Body)
	var area model.Area
	json.Unmarshal(reqBody, &area)

	err := model.CreateArea(model.DB, &area, resourceId, userId)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, area)
	}
}

func DeleteArea(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := model.DeleteArea(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
