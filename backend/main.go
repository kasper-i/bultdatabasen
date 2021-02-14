package main

import (
	authorizer "bultdatabasen/middleware"
	"bultdatabasen/model"
	"log"
	"net/http"

	"encoding/json"

	"github.com/gorilla/mux"
)

func getResourceAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["resourceID"]

	ancestors := model.GetAncestors(model.DB, id)
	for _, ancestor := range ancestors {
		log.Printf("%v", *ancestor.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(ancestors)
}

func getSectors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["resourceID"]

	descendants := model.GetDescendants(model.DB, id, model.LvlSector)
	for _, descendant := range descendants {
		log.Printf("%v", *descendant.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(descendants)
}

func getRoutes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["resourceID"]

	descendants := model.GetDescendants(model.DB, id, model.LvlRoute)
	for _, descendant := range descendants {
		log.Printf("%v", *descendant.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(descendants)
}

func getResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["resourceID"]

	resource, _ := model.FindResourceByID(model.DB, id)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(resource)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)

	authorizer := authorizer.New()

	router.Use(authorizer.Middleware)

	router.HandleFunc("/resources/{resourceID}", getResource)
	router.HandleFunc("/resources/{resourceID}/ancestors", getResourceAncestors)
	router.HandleFunc("/resources/{resourceID}/sectors", getSectors)
	router.HandleFunc("/resources/{resourceID}/routes", getRoutes)
	log.Fatal(http.ListenAndServe(":8080", router))
}