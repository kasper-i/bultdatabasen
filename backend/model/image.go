package model

import (
	"bultdatabasen/spaces"
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/rwcarlsen/goexif/exif"
	"gopkg.in/ini.v1"
	"gorm.io/gorm"
)

var functionUrl string
var functionSecret string

var ImageSizes map[string]int

func init() {
	ImageSizes = make(map[string]int)

	ImageSizes["xs"] = 300
	ImageSizes["sm"] = 500
	ImageSizes["md"] = 750
	ImageSizes["lg"] = 1000
	ImageSizes["xl"] = 1500
	ImageSizes["2xl"] = 2500

	cfg, err := ini.Load("/etc/bultdatabasen.ini")
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	f := strings.Split(cfg.Section("functions").Key("images/resize").String(), " ")
	functionUrl = f[0]
	if len(f) == 2 {
		functionSecret = f[1]
	}
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

func (sess Session) GetImages(resourceID uuid.UUID) ([]Image, error) {
	var images []Image = make([]Image, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s
		SELECT * FROM tree
		INNER JOIN resource ON tree.resource_id = resource.leaf_of
		INNER JOIN image ON resource.id = image.id`, withTreeQuery()), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (sess Session) getImageWithLock(imageID uuid.UUID) (*Image, error) {
	var image Image

	if err := sess.DB.Raw(`SELECT * FROM image INNER JOIN resource ON image.id = resource.id WHERE image.id = ? FOR UPDATE`, imageID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) GetImage(imageID uuid.UUID) (*Image, error) {
	var image Image

	if err := sess.DB.Raw(`SELECT * FROM image WHERE image.id = ?`, imageID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) UploadImage(parentResourceID uuid.UUID, imageBytes []byte, mimeType string) (*Image, error) {
	img := Image{
		ResourceBase: ResourceBase{
			ID: uuid.New(),
		},
		Timestamp: time.Now(),
		MimeType:  mimeType,
		Size:      len(imageBytes)}

	resource := Resource{
		ResourceBase: img.ResourceBase,
		Type:         TypeImage,
		LeafOf:       &parentResourceID,
	}

	tempFileName := "/tmp/." + img.ID.String()

	f, err := os.Create(tempFileName)
	if err != nil {
		return nil, err
	}

	defer os.Remove(tempFileName)

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
	if err == nil {
		if timestamp, err := exifData.DateTime(); err == nil {
			img.Timestamp = timestamp
		}

		if rotation, err := getRotation(exifData); err == nil {
			img.Rotation = rotation
		}
	}

	object := s3.PutObjectInput{
		Bucket:      aws.String("bultdatabasen"),
		Key:         aws.String("images/" + img.ID.String()),
		Body:        bytes.NewReader(imageBytes),
		ACL:         aws.String("public-read"),
		ContentType: &mimeType,
	}

	if _, err := spaces.S3Client().PutObject(&object); err != nil {
		return nil, err
	}

	if err = ResizeImage(img.ID, []string{"sm", "xl"}); err != nil {
		rollbackObjectCreations(img.ID)
		return nil, err
	}

	err = sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(&resource, uuid.Nil); err != nil {
			return err
		}

		if err := sess.DB.Create(&img).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		rollbackObjectCreations(img.ID)
		return nil, err
	}

	return &img, nil
}

func rollbackObjectCreations(imageID uuid.UUID) {
	listInput := &s3.ListObjectsInput{
		Bucket: aws.String("bultdatabasen"),
		Prefix: aws.String("images/" + imageID.String()),
	}

	if objects, err := spaces.S3Client().ListObjects(listInput); err != nil {
		return
	} else {
		for _, object := range objects.Contents {
			deleteInput := s3.DeleteObjectInput{
				Bucket: aws.String("bultdatabasen"),
				Key:    aws.String(*object.Key),
			}

			_, _ = spaces.S3Client().DeleteObject(&deleteInput)
		}
	}
}

func (sess Session) DeleteImage(imageID uuid.UUID) error {
	err := sess.Transaction(func(sess Session) error {
		if err := sess.DeleteResource(imageID); err != nil {
			return err
		}

		return nil
	})

	return err
}

func (sess Session) PatchImage(imageID uuid.UUID, patch ImagePatch) error {
	original, err := sess.getImageWithLock(imageID)
	if err != nil {
		return err
	}

	if patch.Rotation != nil {
		original.Rotation = *patch.Rotation
	}

	return sess.Transaction(func(sess Session) error {
		if err := sess.TouchResource(imageID); err != nil {
			return err
		}

		if err := sess.DB.Select("Rotation").Updates(original).Error; err != nil {
			return err
		}

		return nil
	})
}

func GetOriginalImageKey(imageID uuid.UUID) string {
	return "images/" + imageID.String()
}

func GetResizedImageKey(imageID uuid.UUID, version string) string {
	return "images/" + imageID.String() + "." + version
}

func ResizeImage(imageID uuid.UUID, versions []string) error {
	values := map[string]interface{}{"imageId": imageID, "sizes": versions}
	json_data, err := json.Marshal(values)
	if err != nil {
		return err
	}

	req, _ := http.NewRequest(
		"POST",
		functionUrl,
		bytes.NewReader(json_data))

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Require-Whisk-Auth", functionSecret)

	if resp, err := http.DefaultClient.Do(req); err != nil {
		return err
	} else if resp.StatusCode != 204 {
		return fmt.Errorf("images/resize: %s", resp.Status)
	}

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
