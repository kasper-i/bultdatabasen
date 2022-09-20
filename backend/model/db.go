package model

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/ini.v1"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func init() {
	var err error

	cfg, err := ini.Load("/etc/bultdatabasen.ini")
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	var database string
	var host string
	var port string
	var username string
	var password string

	database = cfg.Section("database").Key("database").String()
	host = cfg.Section("database").Key("host").String()
	port = cfg.Section("database").Key("port").String()
	username = cfg.Section("database").Key("username").String()
	password = cfg.Section("database").Key("password").String()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", username, password, host, port, database)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		panic("failed to connect database")
	}

	sqlDB, err := DB.DB()

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}
