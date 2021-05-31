package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID       string    `gorm:"primaryKey" json:"id"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
	JoinDate time.Time `json:"join_date"`
}

func (User) TableName() string {
	return "user"
}

func GetUser(db *gorm.DB, userID string) (*User, error) {
	var user User

	if err := db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func UpdateUser(db *gorm.DB, user *User) error {
	if err := db.Save(&user).Error; err != nil {
		return err
	}

	return nil
}

func CreateUser(db *gorm.DB, user *User) error {
	if err := db.Create(&user).Error; err != nil {
		return err
	}

	return nil
}
