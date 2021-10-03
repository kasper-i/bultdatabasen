package api

import (
	"bultdatabasen/utils"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"
)

func GetImages(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	if images, err := sess.GetImages(parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, images)
	}
}

func GetImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID := vars["resourceID"]

	if image, err := sess.GetImage(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		w.Header().Set("Content-Type", image.MimeType)
		http.ServeFile(w, r, "images/"+image.ID)
	}
}

func GetThumbnail(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID := vars["resourceID"]

	if image, err := sess.GetImage(resourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		w.Header().Set("Content-Type", image.MimeType)
		http.ServeFile(w, r, "images/"+image.ID+".thumb")
	}
}

func UploadImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("image")
	if err != nil {
		utils.WriteError(w, err)
		return
	}
	defer file.Close()

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	mimeType := http.DetectContentType(fileBytes)

	switch mimeType {
	case "image/jpeg", "image/jpg":
		image, err := sess.UploadImage(parentResourceID, fileBytes, mimeType)

		if err != nil {
			utils.WriteError(w, err)
		} else {
			utils.WriteResponse(w, http.StatusCreated, image)
		}
	default:
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}
}

func DeleteImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	resourceID := vars["resourceID"]

	err := sess.DeleteImage(resourceID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
