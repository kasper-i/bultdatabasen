package main

import (
	"bultdatabasen/api"
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/middleware/cors"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func checkHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	io.WriteString(w, `{"alive": true}`)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)

	authenticator := authenticator.New()
	authorizer := authorizer.New()

	router.Use(authenticator.Middleware)
	router.Use(authorizer.Middleware)
	router.Use(cors.CORSMiddleware)

	router.HandleFunc("/health", checkHandler)

	router.HandleFunc("/users/myself", api.GetMyUser).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}/teams/{teamID}", nil).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/users/{userID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)

	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/invites", nil).Methods(http.MethodPost, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/ancestors", api.GetAncestors).Methods(http.MethodGet, http.MethodOptions)

	router.HandleFunc("/areas", api.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas", api.CreateArea).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", api.GetArea).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/areas/{resourceID}", api.DeleteArea).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/crags", api.GetCrags).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/crags", api.CreateCrag).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", api.GetCrag).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/crags/{resourceID}", api.DeleteCrag).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/sectors", api.GetSectors).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/sectors", api.CreateSector).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", api.GetSector).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/sectors/{resourceID}", api.DeleteSector).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/routes", api.GetRoutes).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/routes", api.CreateRoute).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", api.GetRoute).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}", api.DeleteRoute).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points", nil).Methods(http.MethodGet, http.MethodOptions)

	router.HandleFunc("/routes/{resourceID}/points", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points", nil).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/points/{resourceID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/points/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/points/{resourceID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/bolts", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/bolts", nil).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/bolts/{boltID}/parts", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/bolts/{boltID}/parts", nil).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/parts/{boltID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/parts/{boltID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/parts/{boltID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	log.Fatal(http.ListenAndServe(":8080", router))
}
