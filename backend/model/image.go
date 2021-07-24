package model

import (
	"image"
	"image/jpeg"
	"io"
	"os"
	"time"

	"golang.org/x/image/draw"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Image struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	MimeType    string    `json:"mimeType"`
	Timestamp   time.Time `json:"timestamp"`
	Description string    `json:"description"`
	Rotation    int       `json:"rotation"`
	Size        int       `json:"size"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
}

func (Image) TableName() string {
	return "image"
}

func GetImages(db *gorm.DB, resourceID string) ([]Image, error) {
	var images []Image = make([]Image, 0)

	if err := db.Raw(getDescendantsQuery("image"), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func GetImage(db *gorm.DB, resourceID string) (*Image, error) {
	var image Image

	if err := db.Raw(`SELECT * FROM image WHERE image.id = ?`, resourceID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func UploadImage(db *gorm.DB, parentResourceID string, bytes []byte, mimeType string) (*Image, error) {
	img := Image{
		ID:        uuid.Must(uuid.NewRandom()).String(),
		Timestamp: time.Now(),
		MimeType:  mimeType,
		Size:      len(bytes)}

	resource := Resource{
		ID:       img.ID,
		Type:     "image",
		ParentID: &parentResourceID,
	}

	fileName := getImagePath(img.ID)
	tempFileName := getImagePath("." + img.ID)

	thumbName := getImagePath(img.ID + ".thumb")
	tempThumbName := getImagePath("." + img.ID + ".thumb")

	f, err := os.Create(tempFileName)
	if err != nil {
		return nil, err
	}

	if _, err = f.Write(bytes); err != nil {
		return nil, err
	}

	f.Seek(0, io.SeekStart)
	decodedImage, _, err := image.Decode(f)
	if err != nil {
		return nil, err
	}

	img.Width = decodedImage.Bounds().Dx()
	img.Height = decodedImage.Bounds().Dy()

	if err := createThumbnail(decodedImage, tempThumbName); err != nil {
		return nil, err
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := createResource(tx, resource); err != nil {
			return err
		}

		if err := tx.Create(&img).Error; err != nil {
			return err
		}

		if err := os.Rename(tempFileName, fileName); err != nil {
			return err
		}

		if err := os.Rename(tempThumbName, thumbName); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		os.Remove(fileName)
		os.Remove(tempFileName)
		os.Remove(thumbName)
		os.Remove(tempThumbName)
		return nil, err
	}

	return &img, nil
}

func DeleteImage(db *gorm.DB, resourceID string) error {
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Image{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&Resource{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := os.Remove(getImagePath(resourceID)); err != nil {
			return err
		}

		if err := os.Remove(getImagePath(resourceID + ".thumb")); err != nil {
			return err
		}

		return nil
	})

	return err
}

func getImagePath(imageID string) string {
	return "images/" + imageID
}

func createThumbnail(src image.Image, dstPath string) error {
	var thumbnail *image.RGBA
	output, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer output.Close()

	width := src.Bounds().Dx()
	height := src.Bounds().Dy()

	if width >= height {
		thumbnail = image.NewRGBA(image.Rect(0, 0, 200, int((200/float32(width))*float32(height))))
	} else {
		thumbnail = image.NewRGBA(image.Rect(0, 0, int((200/float32(height))*float32(width)), 200))
	}

	draw.BiLinear.Scale(thumbnail, thumbnail.Rect, src, src.Bounds(), draw.Over, nil)

	return jpeg.Encode(output, thumbnail, &jpeg.Options{Quality: jpeg.DefaultQuality})
}
