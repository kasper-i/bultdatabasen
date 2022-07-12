package spaces

import (
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"gopkg.in/ini.v1"
)

var s3Client *s3.S3

func init() {
	var err error

	cfg, err := ini.Load("/etc/bultdatabasen.ini")
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	key := cfg.Section("spaces").Key("key").String()
	secret := cfg.Section("spaces").Key("secret").String()

	s3Config := &aws.Config{
		Credentials: credentials.NewStaticCredentials(key, secret, ""),
		Endpoint:    aws.String("https://ams3.digitaloceanspaces.com"),
		Region:      aws.String("us-east-1"),
	}

	newSession := session.New(s3Config)
	s3Client = s3.New(newSession)
}

func S3Client() *s3.S3 {
	return s3Client
}
