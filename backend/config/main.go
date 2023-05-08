package config

import (
	"os"

	"github.com/BurntSushi/toml"
)

type Config struct {
	Database struct {
		Database string
		Schema   string
		Host     string
		Port     int
		Username string
		Password string
		Debug    bool
	}
	Spaces struct {
		Bucket string
		Key    string
		Secret string
	}
	Functions []struct {
		Name   string
		URL    string
		Secret string
	}
	Cognito struct {
		AccessKey       string `toml:"access_key"`
		SecretAccessKey string `toml:"secret_access_key"`
		Region          string
		UserPoolID      string `toml:"user_pool_id"`
	}
	SMTP struct {
		Host     string
		Port     int
		TLS      bool
		Username string
		Password string
	}
}

func Read() (Config, error) {
	var cfg Config

	doc, err := os.ReadFile("/etc/bultdatabasen/config.toml")
	if err != nil {
		return cfg, err
	}

	err = toml.Unmarshal([]byte(doc), &cfg)
	if err != nil {
		return cfg, err
	}

	return cfg, nil
}
