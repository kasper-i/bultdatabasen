package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetBolts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if bolts, err := model.GetBolts(model.DB, parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, bolts)
	}
}

func GetBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if bolt, err := model.GetBolt(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, bolt)
	}
}

func CreateBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var bolt model.Bolt
	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := model.CreateBolt(model.DB, &bolt, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusCreated, bolt)
	}
}

func DeleteBolt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := model.DeleteBolt(model.DB, resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
