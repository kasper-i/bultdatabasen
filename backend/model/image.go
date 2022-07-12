package model

import (
	"bultdatabasen/spaces"
	"bytes"
	"encoding/json"
	"image"
	_ "image/jpeg"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/rwcarlsen/goexif/exif"
	"gorm.io/gorm"
)

var ImageSizes map[string]int

func init() {
	ImageSizes = make(map[string]int)

	ImageSizes["xs"] = 300
	ImageSizes["sm"] = 500
	ImageSizes["md"] = 750
	ImageSizes["lg"] = 1000
	ImageSizes["xl"] = 1500
	ImageSizes["2xl"] = 2500
}

type Image struct {
	ResourceBase
	MimeType    string    `json:"mimeType"`
	Timestamp   time.Time `json:"timestamp"`
	Description string    `json:"description"`
	Rotation    int       `json:"rotation"`
	Size        int       `json:"size"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	UserID      string    `gorm:"->;column:buser_id" json:"userId"`
}

type ImagePatch struct {
	Rotation *int `json:"rotation"`
}

func (Image) TableName() string {
	return "image"
}

func (sess Session) GetImages(resourceID string) ([]Image, error) {
	var images []Image = make([]Image, 0)

	if err := sess.DB.Raw(buildDescendantsQuery("image"), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (sess Session) GetImage(imageID string) (*Image, error) {
	var image Image

	if err := sess.DB.Raw(`SELECT * FROM image WHERE image.id = ?`, imageID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) UploadImage(parentResourceID string, imageBytes []byte, mimeType string) (*Image, error) {
	img := Image{
		ResourceBase: ResourceBase{
			ID: uuid.Must(uuid.NewRandom()).String(),
		},
		Timestamp: time.Now(),
		MimeType:  mimeType,
		Size:      len(imageBytes)}

	resource := Resource{
		ResourceBase: img.ResourceBase,
		Type:         "image",
		ParentID:     &parentResourceID,
	}

	tempFileName := "/tmp/." + img.ID

	f, err := os.Create(tempFileName)
	if err != nil {
		return nil, err
	}

	if _, err = f.Write(imageBytes); err != nil {
		return nil, err
	}

	if _, err := f.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	decodedImage, _, err := image.Decode(f)
	if err != nil {
		return nil, err
	}

	img.Width = decodedImage.Bounds().Dx()
	img.Height = decodedImage.Bounds().Dy()

	if _, err := f.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	exifData, err := exif.Decode(f)
	if err != nil {
		return nil, err
	}

	if timestamp, err := exifData.DateTime(); err == nil {
		img.Timestamp = timestamp
	}

	if rotation, err := getRotation(exifData); err == nil {
		img.Rotation = rotation
	}

	object := s3.PutObjectInput{
		Bucket:      aws.String("bultdatabasen"),
		Key:         aws.String("images/" + img.ID),
		Body:        bytes.NewReader(imageBytes),
		ACL:         aws.String("public-read"),
		ContentType: &mimeType,
	}

	if _, err := spaces.S3Client().PutObject(&object); err != nil {
		return nil, err
	}

	if err = ResizeImage(img.ID, []string{"sm", "xl"}); err != nil {
		return nil, err
	}

	err = sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&img).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		os.Remove(tempFileName)
		return nil, err
	}

	return &img, nil
}

func (sess Session) DeleteImage(imageID string) error {
	err := sess.Transaction(func(sess Session) error {
		if err := sess.deleteResource(imageID); err != nil {
			return err
		}

		return nil
	})

	return err
}

func (sess Session) PatchImage(imageID string, patch ImagePatch) error {
	original, err := sess.GetImage(imageID)
	if err != nil {
		return err
	}

	if patch.Rotation != nil {
		original.Rotation = *patch.Rotation
	}

	return sess.Transaction(func(sess Session) error {
		if err := sess.touchResource(imageID); err != nil {
			return err
		}

		if err := sess.DB.Select("Rotation").Updates(original).Error; err != nil {
			return err
		}

		return nil
	})
}

func GetOriginalImageKey(imageID string) string {
	return "images/" + imageID
}

func GetResizedImageKey(imageID string, version string) string {
	return "images/" + imageID + "." + version
}

func ResizeImage(imageID string, versions []string) error {
	values := map[string]interface{}{"imageId": imageID, "sizes": versions}
	json_data, err := json.Marshal(values)
	if err != nil {
		return err
	}

	req, _ := http.NewRequest(
		"POST",
		"https://faas-ams3-2a2df116.doserverless.co/api/v1/web/fn-4a68506f-5753-426e-94e1-890c577ca0ca/images/resize",
		bytes.NewReader(json_data))

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Require-Whisk-Auth", "Ax6z5hn2JtsDAHN")

	_, err = http.DefaultClient.Do(req)

	return err
}

func getRotation(exifData *exif.Exif) (int, error) {
	raw, err := exifData.Get(exif.Orientation)
	if err != nil {
		return 0, err
	}

	orientation, err := raw.Int(0)
	if err != nil {
		return 0, err
	}

	switch orientation {
	case 1:
		return 0, nil
	case 8:
		return 270, nil
	case 3:
		return 180, nil
	case 6:
		return 90, nil
	}

	return 0, nil
}
