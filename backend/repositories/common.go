package repositories

import (
	"context"
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

type txKey struct{}

type psqlDatastore struct {
	__tx *gorm.DB
}

func NewDatastore() *psqlDatastore {
	return &psqlDatastore{
		__tx: db,
	}
}

func injectTx(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

func extractTx(ctx context.Context) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}

	return nil
}

func (store *psqlDatastore) tx(ctx context.Context) *gorm.DB {
	tx := extractTx(ctx)
	if tx != nil {
		return tx
	}

	return store.__tx
}

func (store *psqlDatastore) WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return err
	}

	err := fn(injectTx(ctx, tx))
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
