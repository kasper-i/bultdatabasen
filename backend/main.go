package main

import (
	"bultdatabasen/authenticator"
	"bultdatabasen/authorizer"
	"bultdatabasen/datastores"
	httpdelivery "bultdatabasen/delivery/http"
	"bultdatabasen/domain"
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

	authn := authenticator.New()
	authz := authorizer.New(datastore)

	var rm domain.ResourceManager

	userUsecase := usecases.NewUserUsecase(authn, datastore)
	resourceUseCase := usecases.NewResourceUsecase(authn, authz, datastore, rm)
	areaUsecase := usecases.NewAreaUsecase(authn, authz, datastore, rm)
	cragUsecase := usecases.NewCragUsecase(authn, authz, datastore, rm)
	sectorUsecase := usecases.NewSectorUsecase(authn, authz, datastore, rm)
	routeUsecase := usecases.NewRouteUsecase(authn, authz, datastore, rm)
	pointUsecase := usecases.NewPointUsecase(authn, authz, datastore, rm)
	imageUsecase := usecases.NewImageUsecase(authn, authz, datastore, rm)
	boltUsecase := usecases.NewBoltUsecase(authn, authz, datastore, rm)
	taskUsecase := usecases.NewTaskUsecase(authn, authz, datastore, rm)
	manufacturerUsecase := usecases.NewManufacturerUsecase(datastore)
	materialUsecase := usecases.NewMaterialUsecase(datastore)

	router.Use(CORSMiddleware)
	router.Use(authn.Middleware)

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
	httpdelivery.NewPointHandler(router, pointUsecase)
	httpdelivery.NewImageHandler(router, imageUsecase)
	httpdelivery.NewBoltHandler(router, boltUsecase)
	httpdelivery.NewTaskHandler(router, taskUsecase)
	httpdelivery.NewManufacturerHandler(router, manufacturerUsecase)
	httpdelivery.NewMaterialHandler(router, materialUsecase)

	router.HandleFunc("/trash", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/trash/{resourceID}/restore", nil).Methods(http.MethodPost, http.MethodOptions)

	log.Fatal(http.ListenAndServe(":8080", handlers.RecoveryHandler(handlers.PrintRecoveryStack(true))(router)))
}
