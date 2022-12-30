package main

import (
	"bultdatabasen/datastores"
	httpdelivery "bultdatabasen/delivery/http"
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/middleware/cors"
	"bultdatabasen/middleware/trashbin"
	"bultdatabasen/usecases"
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

	datastore := datastores.NewDatastore()

	userUsecase := usecases.NewUserUsecase(datastore)
	resourceUseCase := usecases.NewResourceUsecase(datastore)
	areaUsecase := usecases.NewAreaUsecase(datastore)
	cragUsecase := usecases.NewCragUsecase(datastore)
	sectorUsecase := usecases.NewSectorUsecase(datastore)
	routeUsecase := usecases.NewRouteUsecase(datastore)
	pointUsecase := usecases.NewPointUsecase(datastore)
	imageUsecase := usecases.NewImageUsecase(datastore)
	boltUsecase := usecases.NewBoltUsecase(datastore)
	taskUsecase := usecases.NewTaskUsecase(datastore)
	manufacturerUsecase := usecases.NewManufacturerUsecase(datastore)
	materialUsecase := usecases.NewMaterialUsecase(datastore)

	trashbin := trashbin.New(datastore)
	authenticator := authenticator.New()
	authorizer := authorizer.New(datastore)

	router.Use(cors.CORSMiddleware)
	router.Use(trashbin.Middleware)
	router.Use(authenticator.Middleware)
	router.Use(authorizer.Middleware)

	router.HandleFunc("/health", checkHandler)
	router.HandleFunc("/version", getVersion)

	httpdelivery.NewUserHandler(router, userUsecase)

	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/invites", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/teams/{teamID}/users/{userID}", nil).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/invites", nil).Methods(http.MethodPost, http.MethodOptions)

	httpdelivery.NewResourceHandler(router, resourceUseCase, datastore)
	httpdelivery.NewAreaHandler(router, areaUsecase)
	httpdelivery.NewCragHandler(router, cragUsecase)
	httpdelivery.NewSectorHandler(router, sectorUsecase)
	httpdelivery.NewRouteHandler(router, routeUsecase)
	httpdelivery.NewPointHandler(router, pointUsecase, resourceUseCase)
	httpdelivery.NewImageHandler(router, imageUsecase)
	httpdelivery.NewBoltHandler(router, boltUsecase)
	httpdelivery.NewTaskHandler(router, taskUsecase)
	httpdelivery.NewManufacturerHandler(router, manufacturerUsecase)
	httpdelivery.NewMaterialHandler(router, materialUsecase)

	router.HandleFunc("/trash", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/trash/{resourceID}/restore", nil).Methods(http.MethodPost, http.MethodOptions)

	log.Fatal(http.ListenAndServe(":8080", handlers.RecoveryHandler(handlers.PrintRecoveryStack(true))(router)))
}
