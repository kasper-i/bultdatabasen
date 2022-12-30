package repositories

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/ini.v1"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

func init() {
	var err error

	cfg, err := ini.Load("/etc/bultdatabasen/config.ini")
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	var database string
	var schema string
	var host string
	var port string
	var username string
	var password string
	var debug bool

	database = cfg.Section("database").Key("database").String()
	schema = cfg.Section("database").Key("schema").String()
	host = cfg.Section("database").Key("host").String()
	port = cfg.Section("database").Key("port").String()
	username = cfg.Section("database").Key("username").String()
	password = cfg.Section("database").Key("password").String()
	debug = cfg.Section("database").Key("debug").MustBool()

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable search_path=%s TimeZone=Europe/Stockholm",
		host, username, password, database, port, schema)

	var logLevel logger.LogLevel = logger.Warn
	if debug {
		logLevel = logger.Info
	}

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		panic("failed to connect database")
	}

	sqlDB, _ := db.DB()

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}
