package http

import (
	"bultdatabasen/domain"
	"bultdatabasen/usecases"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type imageHandler struct {
	imageUsecase domain.ImageUsecase
}

func NewImageHandler(router *mux.Router, imageUsecase domain.ImageUsecase) {
	handler := &imageHandler{
		imageUsecase: imageUsecase,
	}

	router.HandleFunc("/resources/{resourceID}/images", handler.UploadImage).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/resources/{resourceID}/images", handler.GetImages).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", handler.DeleteImage).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}", handler.PatchImage).Methods(http.MethodPatch, http.MethodOptions)
	router.HandleFunc("/images/{resourceID}/{version}", handler.DownloadImage).Methods(http.MethodGet, http.MethodOptions)
}

func (hdlr *imageHandler) GetImages(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	if images, err := hdlr.imageUsecase.GetImages(r.Context(), parentResourceID); err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusOK, images)
	}
}

func (hdlr *imageHandler) DownloadImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}
	var version *string
	if value := vars["version"]; value != "" {
		version = &value
	}

	if url, err := hdlr.imageUsecase.GetImageDownloadURL(r.Context(), imageID, version); err != nil {
		writeError(w, err)
	} else {
		w.Header().Set("Location", url)
		writeResponse(w, http.StatusTemporaryRedirect, nil)
	}
}

func (hdlr *imageHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	parentResourceID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	err = r.ParseMultipartForm(32 << 20)
	if err != nil {
		writeError(w, err)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		writeError(w, err)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		writeError(w, err)
		return
	}

	mimeType := http.DetectContentType(fileBytes)

	image, err := hdlr.imageUsecase.UploadImage(r.Context(), parentResourceID, fileBytes, mimeType)
	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusCreated, image)
	}
}

func (hdlr *imageHandler) DeleteImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	err = hdlr.imageUsecase.DeleteImage(r.Context(), imageID)

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}

func (hdlr *imageHandler) PatchImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	imageID, err := uuid.Parse(vars["resourceID"])
	if err != nil {
		writeError(w, err)
		return
	}

	reqBody, _ := io.ReadAll(r.Body)
	var patch usecases.ImagePatch
	if err := json.Unmarshal(reqBody, &patch); err != nil {
		writeError(w, err)
		return
	}

	switch {
	case patch.Rotation != nil:
		err = hdlr.imageUsecase.RotateImage(r.Context(), imageID, *patch.Rotation)
	}

	if err != nil {
		writeError(w, err)
	} else {
		writeResponse(w, http.StatusNoContent, nil)
	}
}
