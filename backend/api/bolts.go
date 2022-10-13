package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/mux"
)

func GetBolts(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	if bolts, err := sess.GetBolts(parentResourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, bolts)
	}
}

func GetBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if bolt, err := sess.GetBolt(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		bolt.WithAncestors(r)
		utils.WriteResponse(w, http.StatusOK, bolt)
	}
}

func CreateBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var bolt model.Bolt
	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		utils.WriteError(w, err)
		return
	}

	err := sess.CreateBolt(&bolt, parentResourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		bolt.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, bolt)
	}
}

func DeleteBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceId := vars["resourceID"]

	if err := sess.DeleteBolt(resourceId); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func UpdateBolt(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	boltID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var bolt model.Bolt

	if err := json.Unmarshal(reqBody, &bolt); err != nil {
		utils.WriteError(w, err)
		return
	}

	updatedBolt, err := sess.UpdateBolt(boltID, bolt)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, updatedBolt)
	}
}
