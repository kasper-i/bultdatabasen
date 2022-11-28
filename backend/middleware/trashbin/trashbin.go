package trashbin

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"context"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type trashbin struct {
}

func New() *trashbin {
	return &trashbin{}
}

func (authorizer *trashbin) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		resourceID, err := uuid.Parse(vars["resourceID"])
		if err != nil {
			utils.WriteError(w, err)
			return
		}

		if resourceID == uuid.Nil {
			next.ServeHTTP(w, r)
			return
		}

		if resourceID.String() == model.RootID {
			next.ServeHTTP(w, r)
			return
		}

		sess := model.NewSession(model.DB, nil)

		ancestors, err := sess.GetAncestors(resourceID)
		if err != nil {
			panic(err)
		}

		var foundRoot bool = false
		for _, ancestor := range ancestors {
			if ancestor.ID.String() == model.RootID {
				foundRoot = true
				break
			}
		}

		if foundRoot {
			ctx := context.WithValue(r.Context(), "ancestors", ancestors)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			writeNotFound(w, resourceID)
		}
	})
}

func writeNotFound(w http.ResponseWriter, resourceID uuid.UUID) {
	err := utils.Error{
		Status:     http.StatusNotFound,
		Message:    "Not Found",
		ResourceID: resourceID,
	}

	w.WriteHeader(http.StatusNotFound)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(err)
}
