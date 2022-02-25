package main

import (
	"bultdatabasen/api"
	"bultdatabasen/middleware/authenticator"
	"bultdatabasen/middleware/authorizer"
	"bultdatabasen/middleware/cors"
	"bultdatabasen/middleware/trashbin"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func checkHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	io.WriteString(w, `{"alive": true}`)
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

	router.HandleFunc("/users/myself", api.GetMyself).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/{userID}", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/users/myself", api.UpdateMyself).Methods(http.MethodPut, http.MethodOptions)
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
	router.HandleFunc("/resources/{resourceID}/children", api.GetChildren).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/counts", api.GetCounts).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/role", api.GetUserRoleForResource).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources", api.Search).Methods(http.MethodGet, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/areas", api.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/areas", api.GetAreas).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/areas", api.CreateArea).Methods(http.MethodPost, http.MethodOptions)
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

	router.HandleFunc("/routes/{resourceID}/points", api.GetPoints).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points", api.AttachPoint).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/routes/{resourceID}/points/{pointID}", api.DetachPoint).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/images", api.UploadImage).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/images", api.GetImages).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", api.DeleteImage).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", api.PatchImage).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}/{version}", api.DownloadImage).Methods(http.MethodGet, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/bolts", api.GetBolts).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/bolts", api.CreateBolt).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", api.GetBolt).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", nil).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/bolts/{resourceID}", api.DeleteBolt).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/resources/{resourceID}/tasks", api.GetTasks).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/tasks", api.CreateTask).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", api.GetTask).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", api.UpdateTask).Methods(http.MethodPut, http.MethodOptions)
	router.HandleFunc("/tasks/{resourceID}", api.DeleteTask).Methods(http.MethodDelete, http.MethodOptions)

	router.HandleFunc("/trash", nil).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/trash/{resourceID}/restore", nil).Methods(http.MethodPost, http.MethodOptions)

	log.Fatal(http.ListenAndServe(":8080", handlers.RecoveryHandler(handlers.PrintRecoveryStack(true))(router)))
}
