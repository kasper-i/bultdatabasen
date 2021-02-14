package main

import (
	authorizer "bultdatabasen/middleware"
	"bultdatabasen/model"
	"io"
	"io/ioutil"
	"log"
	"net/http"

	"encoding/json"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func getResourceAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	ancestors := model.GetAncestors(model.DB, id)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(ancestors)
}

func getSectors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	descendants := model.GetDescendants(model.DB, id, model.DepthSector)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(descendants)
}

func getRoutes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceId := vars["resourceID"]

	routes := model.GetRoutes(model.DB, parentResourceId)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(routes)
}

func createRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var route model.Route
	json.Unmarshal(reqBody, &route)

	route.ID = uuid.Must(uuid.NewRandom()).String()

	resource := model.Resource{
		ID:       route.ID,
		Name:     route.Name,
		Type:     "route",
		ParentID: &parentResourceID,
	}
	resource.SetDepth()

	err := model.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&resource).Error; err != nil {
			return err
		}

		if err := tx.Create(&route).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		http.Error(w, "Forbidden", http.StatusInternalServerError)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		json.NewEncoder(w).Encode(route)
	}
}

func getResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	resource, _ := model.FindResourceByID(model.DB, id)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(resource)
}

func createChildResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	reqBody, _ := ioutil.ReadAll(r.Body)
	var resource model.Resource
	json.Unmarshal(reqBody, &resource)

	resource.SetDepth()
	resource.ID = uuid.Must(uuid.NewRandom()).String()
	resource.ParentID = &parentResourceID
	model.DB.Create(&resource)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(resource)
}

func checkHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	io.WriteString(w, `{"alive": true}`)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)

	authorizer := authorizer.New()

	router.Use(authorizer.Middleware)
	router.Use(mux.CORSMethodMiddleware(router))

	router.HandleFunc("/resources/{resourceID}", getResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}", createChildResource).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/ancestors", getResourceAncestors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/sectors", getSectors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/routes", getRoutes).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/routes", createRoute).Methods(http.MethodPost, http.MethodOptions)

	router.HandleFunc("/health", checkHandler)

	log.Fatal(http.ListenAndServe(":8080", router))
}
