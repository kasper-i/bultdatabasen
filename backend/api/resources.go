package api

import (
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func GetAncestors(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if ancestors, err := model.GetAncestors(model.DB, id); err != nil {
		utils.WriteError(w, err)
	} else {
		for i, j := 0, len(ancestors)-1; i < j; i, j = i+1, j-1 {
			ancestors[i], ancestors[j] = ancestors[j], ancestors[i]
		}

		utils.WriteResponse(w, http.StatusOK, ancestors)
	}
}

func GetChildren(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["resourceID"]

	if children, err := model.GetChildren(model.DB, id); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, children)
	}
}

func Search(w http.ResponseWriter, r *http.Request) {
	names, ok := r.URL.Query()["name"]

	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	name := strings.TrimSpace(names[0])

	if name == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if results, err := model.Search(model.DB, name); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, results)
	}
}
