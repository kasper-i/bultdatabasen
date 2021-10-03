package model

import (
	"image"
	"image/jpeg"
	"io"
	"os"
	"time"

	"golang.org/x/image/draw"

	"github.com/google/uuid"
	"github.com/rwcarlsen/goexif/exif"
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

func (sess Session) GetImages(resourceID string) ([]Image, error) {
	var images []Image = make([]Image, 0)

	if err := sess.DB.Raw(getDescendantsQuery("image"), resourceID).Scan(&images).Error; err != nil {
		return nil, err
	}

	return images, nil
}

func (sess Session) GetImage(resourceID string) (*Image, error) {
	var image Image

	if err := sess.DB.Raw(`SELECT * FROM image WHERE image.id = ?`, resourceID).
		Scan(&image).Error; err != nil {
		return nil, err
	}

	if image.ID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	return &image, nil
}

func (sess Session) UploadImage(parentResourceID string, bytes []byte, mimeType string) (*Image, error) {
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

	f.Seek(0, io.SeekStart)
	if timestamp, err := getDatetime(f); err != nil {
		return nil, err
	} else {
		img.Timestamp = timestamp
	}

	err = sess.Transaction(func(sess Session) error {
		if err := sess.createResource(resource); err != nil {
			return err
		}

		if err := sess.DB.Create(&img).Error; err != nil {
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

func (sess Session) DeleteImage(resourceID string) error {
	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Delete(&Image{ID: resourceID}).Error; err != nil {
			return err
		}

		if err := sess.DB.Delete(&Resource{ID: resourceID}).Error; err != nil {
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

func getDatetime(f *os.File) (time.Time, error) {
	var tm time.Time

	x, err := exif.Decode(f)
	if err != nil {
		return tm, err
	}

	tm, err = x.DateTime()
	return tm, err
}
