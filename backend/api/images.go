package api

import (
	"bultdatabasen/model"
	"bultdatabasen/spaces"
	"bultdatabasen/utils"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
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

func DownloadImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	imageID := vars["resourceID"]
	version := vars["version"]

	if _, ok := model.ImageSizes[version]; !ok && version != "original" {
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}

	var imageKey string

	if version == "original" {
		imageKey = model.GetOriginalImageKey(imageID)
	} else {
		imageKey = model.GetResizedImageKey(imageID, version)
	}

	input := &s3.ListObjectsInput{
		Bucket: aws.String("bultdatabasen"),
		Prefix: aws.String(imageKey),
	}

	if objects, err := spaces.S3Client().ListObjects(input); err != nil {
		utils.WriteError(w, err)
		return
	} else {
		for _, object := range objects.Contents {
			if *object.Key == imageKey {
				w.Header().Set("Location", fmt.Sprintf("https://bultdatabasen.ams3.digitaloceanspaces.com/%s", imageKey))
				utils.WriteResponse(w, http.StatusTemporaryRedirect, nil)
				return
			}
		}
	}

	utils.WriteResponse(w, http.StatusNotFound, nil)
}

func UploadImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	parentResourceID := vars["resourceID"]

	err := r.ParseMultipartForm(32 << 20)
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
		image, err := sess.UploadImage(parentResourceID, fileBytes, mimeType)

		if err != nil {
			utils.WriteError(w, err)
			return
		}

		image.WithAncestors(r)
		utils.WriteResponse(w, http.StatusCreated, image)
	default:
		utils.WriteResponse(w, http.StatusBadRequest, nil)
		return
	}
}

func DeleteImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	imageID := vars["resourceID"]

	err := sess.DeleteImage(imageID)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}

func PatchImage(w http.ResponseWriter, r *http.Request) {
	sess := createSession(r)
	vars := mux.Vars(r)
	imageID := vars["resourceID"]

	reqBody, _ := io.ReadAll(r.Body)
	var patch model.ImagePatch
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

	err := sess.PatchImage(imageID, patch)

	if err != nil {
		utils.WriteError(w, err)
	} else {
		utils.WriteResponse(w, http.StatusNoContent, nil)
	}
}
