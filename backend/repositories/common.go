package repositories

import (
	"bultdatabasen/config"
	"context"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type txKey struct{}

type psqlDatastore struct {
	tx func(ctx context.Context) *gorm.DB
}

func NewDatastore(config config.Config) (*psqlDatastore, error) {
	var db *gorm.DB

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable search_path=%s",
		config.Database.Host,
		config.Database.Username,
		config.Database.Password,
		config.Database.Database,
		config.Database.Port,
		config.Database.Schema)

	var logLevel logger.LogLevel = logger.Warn
	if config.Database.Debug {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, _ := db.DB()

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	tx := func(ctx context.Context) *gorm.DB {
		if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
			return tx.WithContext(ctx)
		} else {
			return db.WithContext(ctx)
		}
	}

	return &psqlDatastore{
		tx: tx,
	}, nil
}

func isNestedTransaction(tx *gorm.DB) bool {
	committer, ok := tx.Statement.ConnPool.(gorm.TxCommitter)
	return ok && committer != nil
}

func (store *psqlDatastore) WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	tx := store.tx(ctx)
	if isNestedTransaction(tx) {
		return fn(ctx)
	} else {
		tx = tx.Begin()
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return err
	}

	err := fn(context.WithValue(ctx, txKey{}, tx))
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
