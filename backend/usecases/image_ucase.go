package usecases

import (
	"bultdatabasen/domain"
	"bultdatabasen/spaces"
	"bultdatabasen/utils"
	"bytes"
	"context"
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

var spacesBucket string
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

	cfg, err := ini.Load("/etc/bultdatabasen/config.ini")
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	f := strings.Split(cfg.Section("functions").Key("images/resize").String(), " ")
	functionUrl = f[0]
	if len(f) == 2 {
		functionSecret = f[1]
	}

	spacesBucket = cfg.Section("spaces").Key("bucket").String()
}

type ImagePatch struct {
	Rotation *int `json:"rotation"`
}

func (sess Session) GetImages(ctx context.Context, resourceID uuid.UUID) ([]domain.Image, error) {
	var images []domain.Image = make([]domain.Image, 0)

	if err := sess.DB.Raw(fmt.Sprintf(`%s
		SELECT * FROM tree
		INNER JOIN resource ON tree.resource_id = resource.leaf_of
		INNER JOIN image ON resource.id = image.id`, withTreeQuery()), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (sess Session) getImageWithLock(imageID uuid.UUID) (*domain.Image, error) {
	var image domain.Image

	if err := sess.DB.Raw(`SELECT * FROM image INNER JOIN resource ON image.id = resource.id WHERE image.id = ? FOR UPDATE`, imageID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) GetImage(ctx context.Context, imageID uuid.UUID) (*domain.Image, error) {
	var image domain.Image

	if err := sess.DB.Raw(`SELECT * FROM image WHERE image.id = ?`, imageID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) GetImageDownloadURL(ctx context.Context, imageID uuid.UUID, version string) (string, error) {
	var imageKey string

	if version == "original" {
		imageKey = getOriginalImageKey(imageID)
	} else {
		imageKey = getResizedImageKey(imageID, version)
	}

	input := &s3.ListObjectsInput{
		Bucket: aws.String(spacesBucket),
		Prefix: aws.String(imageKey),
	}

	if objects, err := spaces.S3Client().ListObjects(input); err != nil {
		return "", err
	} else {
		for _, object := range objects.Contents {
			if *object.Key == imageKey {
				return fmt.Sprintf("https://%s.ams3.digitaloceanspaces.com/%s", spacesBucket, imageKey), nil
			}
		}
	}

	return "", utils.ErrNotFound
}

func (sess Session) UploadImage(ctx context.Context, parentResourceID uuid.UUID, imageBytes []byte, mimeType string) (*domain.Image, error) {
	img := domain.Image{
		Timestamp: time.Now(),
		MimeType:  mimeType,
		Size:      len(imageBytes)}

	resource := domain.Resource{
		Type: domain.TypeImage,
	}

	reader := bytes.NewReader(imageBytes)

	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	decodedImage, _, err := image.Decode(reader)
	if err != nil {
		return nil, err
	}

	img.Width = decodedImage.Bounds().Dx()
	img.Height = decodedImage.Bounds().Dy()

	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	exifData, err := exif.Decode(reader)
	if err == nil {
		if timestamp, err := exifData.DateTime(); err == nil {
			img.Timestamp = timestamp
		}

		if rotation, err := getRotation(exifData); err == nil {
			img.Rotation = rotation
		}
	}

	err = sess.Transaction(func(sess Session) error {
		if err := sess.CreateResource(ctx, &resource, parentResourceID); err != nil {
			return err
		}

		img.ID = resource.ID
		img.UserID = resource.CreatorID

		object := s3.PutObjectInput{
			Bucket:      aws.String(spacesBucket),
			Key:         aws.String("images/" + img.ID.String()),
			Body:        bytes.NewReader(imageBytes),
			ACL:         aws.String("public-read"),
			ContentType: &mimeType,
		}

		if _, err := spaces.S3Client().PutObject(&object); err != nil {
			return err
		}

		if err = ResizeImage(ctx, img.ID, []string{"sm", "xl"}); err != nil {
			rollbackObjectCreations(img.ID)
			return err
		}

		if err := sess.DB.Create(&img).Error; err != nil {
			return err
		}

		if ancestors, err := sess.GetAncestors(ctx, img.ID); err != nil {
			return nil
		} else {
			img.Ancestors = ancestors
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
		Bucket: aws.String(spacesBucket),
		Prefix: aws.String("images/" + imageID.String()),
	}

	if objects, err := spaces.S3Client().ListObjects(listInput); err != nil {
		return
	} else {
		for _, object := range objects.Contents {
			deleteInput := s3.DeleteObjectInput{
				Bucket: aws.String(spacesBucket),
				Key:    aws.String(*object.Key),
			}

			_, _ = spaces.S3Client().DeleteObject(&deleteInput)
		}
	}
}

func (sess Session) DeleteImage(ctx context.Context, imageID uuid.UUID) error {
	return sess.DeleteResource(ctx, imageID)
}

func (sess Session) PatchImage(ctx context.Context, imageID uuid.UUID, patch ImagePatch) error {
	original, err := sess.getImageWithLock(imageID)
	if err != nil {
		return err
	}

	if patch.Rotation != nil {
		original.Rotation = *patch.Rotation
	}

	return sess.Transaction(func(sess Session) error {
		if err := sess.TouchResource(ctx, imageID); err != nil {
			return err
		}

		if err := sess.DB.Select("Rotation").Updates(original).Error; err != nil {
			return err
		}

		return nil
	})
}

func getOriginalImageKey(imageID uuid.UUID) string {
	return "images/" + imageID.String()
}

func getResizedImageKey(imageID uuid.UUID, version string) string {
	return "images/" + imageID.String() + "." + version
}

func ResizeImage(ctx context.Context, imageID uuid.UUID, versions []string) error {
	var requestedVersions map[string]string = make(map[string]string)

	originalUrl := fmt.Sprintf("https://%s.ams3.digitaloceanspaces.com/%s",
		spacesBucket, getOriginalImageKey(imageID))

	for _, version := range versions {
		req, _ := spaces.S3Client().PutObjectRequest(&s3.PutObjectInput{
			Bucket:      &spacesBucket,
			Key:         aws.String(getResizedImageKey(imageID, version)),
			ACL:         aws.String("public-read"),
			ContentType: aws.String("image/jpeg"),
		})

		urlStr, err := req.Presign(10 * time.Minute)
		if err != nil {
			return err
		}

		requestedVersions[version] = urlStr
	}

	values := map[string]interface{}{
		"downloadUrl": originalUrl,
		"versions":    requestedVersions,
	}

	jsonData, err := json.Marshal(values)
	if err != nil {
		return err
	}

	httpReq, _ := http.NewRequest(
		"POST",
		functionUrl,
		bytes.NewReader(jsonData))

	httpReq.Header.Add("Content-Type", "application/json")
	httpReq.Header.Add("X-Require-Whisk-Auth", functionSecret)

	if resp, err := http.DefaultClient.Do(httpReq); err != nil {
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
