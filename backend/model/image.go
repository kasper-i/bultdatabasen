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
	ID          string    `gorm:"primaryKey" json:"id"`
	MimeType    string    `json:"mimeType"`
	Timestamp   time.Time `json:"timestamp"`
	Description string    `json:"description"`
	Rotation    int       `json:"rotation"`
	Size        int       `json:"size"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
}

type ImagePatch struct {
	Rotation *int `json:"rotation"`
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

	fileName := GetOriginalImageFilePath(img.ID)
	tempFileName := GetOriginalImageFilePath("." + img.ID)

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

	f.Seek(0, io.SeekStart)

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

		return nil
	})

	if err != nil {
		os.Remove(fileName)
		os.Remove(tempFileName)
		return nil, err
	}

	return &img, nil
}

func (sess Session) DeleteImage(imageID string) error {
	err := sess.Transaction(func(sess Session) error {
		if err := sess.DB.Delete(&Image{ID: imageID}).Error; err != nil {
			return err
		}

		if err := sess.DB.Delete(&Resource{ID: imageID}).Error; err != nil {
			return err
		}

		os.Remove(GetOriginalImageFilePath(imageID))

		for version := range ImageSizes {
			os.Remove(GetResizedImageFilePath(imageID, version))
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

func GetOriginalImageFilePath(imageID string) string {
	return "images/" + imageID
}

func GetResizedImageFilePath(imageID string, version string) string {
	return "images/" + imageID + "." + version
}

func ResizeImage(imageID string, version string) error {
	dstPath := GetResizedImageFilePath(imageID, version)
	tmpDstPath := GetResizedImageFilePath("."+imageID, version)
	size := ImageSizes[version]

	reader, err := os.Open(GetOriginalImageFilePath(imageID))
	if err != nil {
		return err
	}
	defer reader.Close()

	decodedImage, _, err := image.Decode(reader)
	if err != nil {
		return err
	}

	var canvas *image.RGBA
	output, err := os.Create(tmpDstPath)
	if err != nil {
		return err
	}
	defer output.Close()
	defer os.Remove(tmpDstPath)

	width := float32(decodedImage.Bounds().Dx())
	height := float32(decodedImage.Bounds().Dy())

	if width >= height {
		canvas = image.NewRGBA(image.Rect(0, 0, size, int((float32(size)/width)*height)))
	} else {
		canvas = image.NewRGBA(image.Rect(0, 0, int((float32(size)/height)*width), size))
	}

	draw.CatmullRom.Scale(canvas, canvas.Rect, decodedImage, decodedImage.Bounds(), draw.Over, nil)

	if err := jpeg.Encode(output, canvas, &jpeg.Options{Quality: jpeg.DefaultQuality}); err != nil {
		return err
	}

	return os.Rename(tmpDstPath, dstPath)
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
