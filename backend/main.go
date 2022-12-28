package main

import (
	httpdelivery "bultdatabasen/delivery/http"
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/middleware/cors"
	"bultdatabasen/middleware/trashbin"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var Version = "devel"

func checkHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	_, _ = io.WriteString(w, `{"alive": true}`)
}

func getVersion(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	_, _ = io.WriteString(w, fmt.Sprintf(`{"version": "%s"}`, Version))
}

func main() {
	router := mux.NewRouter().StrictSlash(true)

	trashbin := trashbin.New()
	authenticator := authenticator.New()
	authorizer := authorizer.New()

	router.Use(cors.CORSMiddleware)
	router.Use(trashbin.Middleware)
	router.Use(authenticator.Middleware)
	router.Use(authorizer.Middleware)

	router.HandleFunc("/health", checkHandler)
	router.HandleFunc("/version", getVersion)

	httpdelivery.NewUserHandler(router)

	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/invites", nil).Methods(http.MethodPost, http.MethodOptions)

	httpdelivery.NewResourceHandler(router)
	httpdelivery.NewAreaHandler(router)
	httpdelivery.NewCragHandler(router)
	httpdelivery.NewSectorHandler(router)
	httpdelivery.NewRouteHandler(router)
	httpdelivery.NewPointHandler(router)
	httpdelivery.NewImageHandler(router)
	httpdelivery.NewBoltHandler(router)
	httpdelivery.NewTaskHandler(router)
	httpdelivery.NewManufacturerHandler(router)
	httpdelivery.NewMaterialHandler(router)

	router.HandleFunc("/trash", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/trash/{resourceID}/restore", nil).Methods(http.MethodPost, http.MethodOptions)

	log.Fatal(http.ListenAndServe(":8080", handlers.RecoveryHandler(handlers.PrintRecoveryStack(true))(router)))
}
