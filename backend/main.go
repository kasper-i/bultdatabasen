package main

import (
	"bultdatabasen/authenticator"
	"bultdatabasen/authorizer"
	httpdelivery "bultdatabasen/delivery/http"
	"bultdatabasen/domain"
	"bultdatabasen/helpers"
	"bultdatabasen/images"
	"bultdatabasen/repositories"
	"bultdatabasen/usecases"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

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

	ds := repositories.NewDatastore()
	var areaRepo domain.AreaRepository = ds
	var boltRepo domain.BoltRepository = ds
	var cragRepo domain.CragRepository = ds
	var imageRepo domain.ImageRepository = ds
	var catalogRepo domain.CatalogRepository = ds
	var pointRepo domain.PointRepository = ds
	var resourceRepo domain.ResourceRepository = ds
	var treeRepo domain.TreeRepository = ds
	var routeRepo domain.RouteRepository = ds
	var sectorRepo domain.SectorRepository = ds
	var taskRepo domain.TaskRepository = ds
	var trashRepo domain.TrashRepository = ds
	var userRepo domain.UserRepository = ds
	var authRepo domain.AuthRepository = ds

	authn := authenticator.New()
	authz := authorizer.New(authRepo, resourceRepo)

	rh := helpers.NewResourceHelper(resourceRepo, treeRepo, trashRepo)
	ib, err := images.NewImageBucket()
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	userUsecase := usecases.NewUserUsecase(authn, userRepo)
	resourceUseCase := usecases.NewResourceUsecase(authn, authz, resourceRepo, rh)
	areaUsecase := usecases.NewAreaUsecase(authn, authz, areaRepo, authRepo, rh)
	cragUsecase := usecases.NewCragUsecase(authn, authz, cragRepo, rh)
	sectorUsecase := usecases.NewSectorUsecase(authn, authz, sectorRepo, rh)
	routeUsecase := usecases.NewRouteUsecase(authn, authz, routeRepo, rh)
	pointUsecase := usecases.NewPointUsecase(authn, authz, pointRepo, routeRepo, resourceRepo, treeRepo, boltRepo, rh)
	imageUsecase := usecases.NewImageUsecase(authn, authz, imageRepo, rh, ib)
	boltUsecase := usecases.NewBoltUsecase(authn, authz, boltRepo, rh)
	taskUsecase := usecases.NewTaskUsecase(authn, authz, taskRepo, rh)
	manufacturerUsecase := usecases.NewManufacturerUsecase(catalogRepo)
	materialUsecase := usecases.NewMaterialUsecase(catalogRepo)

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

	httpdelivery.NewResourceHandler(router, resourceUseCase)
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
