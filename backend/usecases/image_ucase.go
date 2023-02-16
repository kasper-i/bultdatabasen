package usecases

import (
	"bultdatabasen/domain"
	"bytes"
	"context"
	"image"
	_ "image/jpeg"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/rwcarlsen/goexif/exif"
)

type imageUsecase struct {
	imageRepo     domain.ImageRepository
	authenticator domain.Authenticator
	authorizer    domain.Authorizer
	rm            domain.ResourceManager
	ib            domain.ImageBucket
}

func NewImageUsecase(authenticator domain.Authenticator, authorizer domain.Authorizer, imageRepo domain.ImageRepository, rm domain.ResourceManager, ib domain.ImageBucket) domain.ImageUsecase {
	return &imageUsecase{
		imageRepo:     imageRepo,
		authenticator: authenticator,
		authorizer:    authorizer,
		rm:            rm,
		ib:            ib,
	}
}

type ImagePatch struct {
	Rotation *int `json:"rotation"`
}

func (uc *imageUsecase) GetImages(ctx context.Context, resourceID uuid.UUID) ([]domain.Image, error) {
	if err := uc.authorizer.HasPermission(ctx, nil, resourceID, domain.ReadPermission); err != nil {
		return nil, err
	}

	return uc.imageRepo.GetImages(ctx, resourceID)
}

func (uc *imageUsecase) GetImage(ctx context.Context, imageID uuid.UUID) (domain.Image, error) {
	ancestors, err := uc.rm.GetAncestors(ctx, imageID)
	if err != nil {
		return domain.Image{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, nil, imageID, domain.ReadPermission); err != nil {
		return domain.Image{}, err
	}

	image, err := uc.imageRepo.GetImage(ctx, imageID)
	if err != nil {
		return domain.Image{}, err
	}

	image.Ancestors = ancestors
	return image, nil
}

func (uc *imageUsecase) GetImageDownloadURL(ctx context.Context, imageID uuid.UUID, version *string) (string, error) {
	return uc.ib.GetDownloadURL(ctx, imageID, version)
}

func (uc *imageUsecase) UploadImage(ctx context.Context, parentResourceID uuid.UUID, imageBytes []byte, mimeType string) (domain.Image, error) {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return domain.Image{}, err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, parentResourceID, domain.WritePermission); err != nil {
		return domain.Image{}, err
	}

	switch mimeType {
	case "image/jpeg", "image/jpg":
	default:
		return domain.Image{}, domain.ErrUnsupportedMimeType
	}

	img := domain.Image{
		Timestamp: time.Now(),
		MimeType:  mimeType,
		Size:      len(imageBytes)}

	resource := domain.Resource{
		Type: domain.TypeImage,
	}

	reader := bytes.NewReader(imageBytes)

	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return domain.Image{}, err
	}

	decodedImage, _, err := image.Decode(reader)
	if err != nil {
		return domain.Image{}, err
	}

	img.Width = decodedImage.Bounds().Dx()
	img.Height = decodedImage.Bounds().Dy()

	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return domain.Image{}, err
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

	err = uc.imageRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if createdResource, err := uc.rm.CreateResource(txCtx, resource, parentResourceID, user.ID); err != nil {
			return err
		} else {
			img.ID = createdResource.ID
			img.UserID = createdResource.CreatorID
		}

		if err := uc.ib.UploadImage(txCtx, img.ID, imageBytes, mimeType); err != nil {
			return err
		}

		if err = uc.ib.ResizeImage(txCtx, img.ID, "sm", "xl"); err != nil {
			return err
		}

		if err := uc.imageRepo.InsertImage(txCtx, img); err != nil {
			return err
		}

		if img.Ancestors, err = uc.rm.GetAncestors(txCtx, img.ID); err != nil {
			return nil
		}

		return nil
	})

	if err != nil && img.ID != uuid.Nil {
		uc.ib.PurgeImage(ctx, img.ID)
		return domain.Image{}, err
	}

	return img, nil
}

func (uc *imageUsecase) DeleteImage(ctx context.Context, imageID uuid.UUID) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, imageID, domain.WritePermission); err != nil {
		return err
	}

	_, err = uc.imageRepo.GetImage(ctx, imageID)
	if err != nil {
		return err
	}

	return uc.rm.DeleteResource(ctx, imageID, user.ID)
}

func (uc *imageUsecase) RotateImage(ctx context.Context, imageID uuid.UUID, rotation int) error {
	user, err := uc.authenticator.Authenticate(ctx)
	if err != nil {
		return err
	}

	if err := uc.authorizer.HasPermission(ctx, &user, imageID, domain.WritePermission); err != nil {
		return err
	}

	rotation = rotation % 360

	switch rotation {
	case 0, 90, 180, 270:
	default:
		return domain.ErrNonOrthogonalAngle
	}

	original, err := uc.imageRepo.GetImageWithLock(ctx, imageID)
	if err != nil {
		return err
	}

	original.Rotation = rotation

	return uc.imageRepo.WithinTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.rm.TouchResource(txCtx, imageID, user.ID); err != nil {
			return err
		}

		if err := uc.imageRepo.SaveImage(txCtx, original); err != nil {
			return err
		}

		return nil
	})
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
