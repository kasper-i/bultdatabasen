package http

import (
	"bultdatabasen/usecases"
	"bultdatabasen/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ImageHandler struct {
}

func NewImageHandler(router *mux.Router) {
	handler := &ImageHandler{}

	router.HandleFunc("/resources/{resourceID}/images", handler.UploadImage).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/images", handler.GetImages).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", handler.DeleteImage).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", handler.PatchImage).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}/{version}", handler.DownloadImage).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *ImageHandler) GetImages(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	if images, err := sess.GetImages(r.Context(), parentResourceID); err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusOK, images)
	}
}

func (hdlr *ImageHandler) DownloadImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}
	version := vars["version"]

	if _, ok := usecases.ImageSizes[version]; !ok && version != "original" {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	if url, err := sess.GetImageDownloadURL(r.Context(), imageID, version); err != nil {
		utils.WriteError(w, err)
	} else {
		w.Header().Set("Location", url)
		utils.WriteResponse(w, http.StatusTemporaryRedirect, nil)
	}
}

func (hdlr *ImageHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		utils.WriteError(w, err)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	mimeType := http.DetectContentType(fileBytes)

	switch mimeType {
	case "image/jpeg", "image/jpg":
		image, err := sess.UploadImage(r.Context(), parentResourceID, fileBytes, mimeType)

		if err != nil {
			utils.WriteError(w, err)
			return
		}

		utils.WriteResponse(w, http.StatusCreated, image)
	default:
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}
}

func (hdlr *ImageHandler) DeleteImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	err = sess.DeleteImage(r.Context(), imageID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *ImageHandler) PatchImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		utils.WriteError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var patch usecases.ImagePatch
	if err := json.Unmarshal(reqBody, &patch); err != nil {
		utils.WriteError(w, err)
		return
	}

	if patch.Rotation != nil {
		if *patch.Rotation != 0 && *patch.Rotation != 90 && *patch.Rotation != 180 && *patch.Rotation != 270 {
			utils.WriteResponse(w, http.StatusBadRequest, nil)
			return
		}
	}

	err = sess.PatchImage(r.Context(), imageID, patch)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
