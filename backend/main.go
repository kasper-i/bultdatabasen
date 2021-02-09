package main

import (
	"bultdatabasen/model"
	"log"
	"net/http"

	"encoding/json"

	"github.com/gorilla/mux"
)

func getResourceAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["id"]

	ancestors := model.GetAncestors(model.DB, id)
	for _, ancestor := range ancestors {
		log.Printf("%v", *ancestor.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(ancestors)
}

func getSectors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["id"]

	descendants := model.GetDescendants(model.DB, id, model.LvlSector)
	for _, descendant := range descendants {
		log.Printf("%v", *descendant.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(descendants)
}

func getRoutes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["id"]

	descendants := model.GetDescendants(model.DB, id, model.LvlRoute)
	for _, descendant := range descendants {
		log.Printf("%v", *descendant.Name)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(descendants)
}

func getResource(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
    id := vars["id"]

	resource, _ := model.FindResourceByID(model.DB, id)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(resource)
}

func main() {
	myRouter := mux.NewRouter().StrictSlash(true)

	myRouter.HandleFunc("/resources/{id}", getResource)
	myRouter.HandleFunc("/resources/{id}/ancestors", getResourceAncestors)
	myRouter.HandleFunc("/resources/{id}/sectors", getSectors)
	myRouter.HandleFunc("/resources/{id}/routes", getRoutes)
	log.Fatal(http.ListenAndServe(":8080", myRouter))
}
