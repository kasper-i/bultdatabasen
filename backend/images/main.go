package images

import (
	"bultdatabasen/config"
	"bultdatabasen/domain"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
)

const functionName = "images/resize"

var imageSizes map[string]int

func init() {
	imageSizes = make(map[string]int)

	imageSizes["xs"] = 300
	imageSizes["sm"] = 500
	imageSizes["md"] = 750
	imageSizes["lg"] = 1000
	imageSizes["xl"] = 1500
	imageSizes["2xl"] = 2500

}

type spaces struct {
	client         *s3.S3
	spacesBucket   string
	functionUrl    string
	functionSecret string
}

func NewImageBucket(config config.Config) domain.ImageBucket {
	var functionUrl string
	var functionSecret string

	for _, function := range config.Functions {
		if function.Name == functionName {
			functionUrl = function.URL
			functionSecret = function.Secret
		}
	}

	if functionUrl == "" {
		log.Fatalf("missing function config: %s\n", functionName)
	}

	s3Config := &aws.Config{
		Credentials: credentials.NewStaticCredentials(config.Spaces.Key, config.Spaces.Secret, ""),
		Endpoint:    aws.String("https://ams3.digitaloceanspaces.com"),
		Region:      aws.String("us-east-1"),
	}

	newSession, err := session.NewSession(s3Config)
	if err != nil {
		log.Fatalf("%v\n", err)
	}

	s3Client := s3.New(newSession)

	return &spaces{
		client:         s3Client,
		spacesBucket:   config.Spaces.Bucket,
		functionUrl:    functionUrl,
		functionSecret: functionSecret,
	}
}

func (s *spaces) GetDownloadURL(ctx context.Context, imageID uuid.UUID, version *string) (string, error) {
	var imageKey string

	if version == nil {
		imageKey = getOriginalImageKey(imageID)
	} else {
		imageKey = getResizedImageKey(imageID, *version)
	}

	return fmt.Sprintf("https://%s.ams3.digitaloceanspaces.com/%s", s.spacesBucket, imageKey), nil
}

func (s *spaces) UploadImage(ctx context.Context, imageID uuid.UUID, imageBytes []byte, mimeType string) error {
	object := s3.PutObjectInput{
		Bucket:      aws.String(s.spacesBucket),
		Key:         aws.String("images/" + imageID.String()),
		Body:        bytes.NewReader(imageBytes),
		ACL:         aws.String("public-read"),
		ContentType: &mimeType,
	}

	if _, err := s.client.PutObjectWithContext(ctx, &object); err != nil {
		return err
	}

	return nil
}

func (s *spaces) ResizeImage(ctx context.Context, imageID uuid.UUID, versions ...string) error {
	var requestedVersions map[string]string = make(map[string]string)

	originalUrl := fmt.Sprintf("https://%s.ams3.digitaloceanspaces.com/%s",
		s.spacesBucket, getOriginalImageKey(imageID))

	for _, version := range versions {
		req, _ := s.client.PutObjectRequest(&s3.PutObjectInput{
			Bucket:      &s.spacesBucket,
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
		s.functionUrl,
		bytes.NewReader(jsonData))

	httpReq.Header.Add("Content-Type", "application/json")
	httpReq.Header.Add("X-Require-Whisk-Auth", s.functionSecret)

	if resp, err := http.DefaultClient.Do(httpReq); err != nil {
		return err
	} else if resp.StatusCode != 204 {
		return fmt.Errorf("images/resize: %s", resp.Status)
	}

	return err
}

func (s *spaces) PurgeImage(ctx context.Context, imageID uuid.UUID) error {
	listInput := &s3.ListObjectsInput{
		Bucket: aws.String(s.spacesBucket),
		Prefix: aws.String("images/" + imageID.String()),
	}

	if objects, err := s.client.ListObjectsWithContext(ctx, listInput); err != nil {
		return err
	} else {
		for _, object := range objects.Contents {
			deleteInput := s3.DeleteObjectInput{
				Bucket: aws.String(s.spacesBucket),
				Key:    aws.String(*object.Key),
			}

			_, _ = s.client.DeleteObjectWithContext(ctx, &deleteInput)
		}
	}

	return nil
}

func getOriginalImageKey(imageID uuid.UUID) string {
	return "images/" + imageID.String()
}

func getResizedImageKey(imageID uuid.UUID, version string) string {
	return "images/" + imageID.String() + "." + version
}
