package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

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

func (Image) TableName() string {
	return "image"
}

type ImageUsecase interface {
	GetImages(ctx context.Context, resourceID uuid.UUID) ([]Image, error)
	GetImage(ctx context.Context, imageID uuid.UUID) (Image, error)
	GetImageDownloadURL(ctx context.Context, imageID uuid.UUID, version string) (string, error)
	UploadImage(ctx context.Context, parentResourceID uuid.UUID, imageBytes []byte, mimeType string) (Image, error)
	DeleteImage(ctx context.Context, imageID uuid.UUID) error
	RotateImage(ctx context.Context, imageID uuid.UUID, rotation int) error
}

type ImageBucket interface {
	GetDownloadURL(ctx context.Context, imageID uuid.UUID, version string) (string, error)
	UploadImage(ctx context.Context, imageID uuid.UUID, bytes []byte, mimeType string) error
	ResizeImage(ctx context.Context, imageID uuid.UUID, versions ...string) error
	PurgeImage(ctx context.Context, imageID uuid.UUID) error
}

type ImageRepository interface {
	GetImages(ctx context.Context, resourceID uuid.UUID) ([]Image, error)
	GetImageWithLock(ctx context.Context, imageID uuid.UUID) (Image, error)
	GetImage(ctx context.Context, imageID uuid.UUID) (Image, error)
	InsertImage(ctx context.Context, image Image) error
	SaveImage(ctx context.Context, image Image) error
}
