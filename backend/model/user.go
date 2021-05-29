package model

import (
	"gorm.io/gorm"
)

type User struct {
	ID    string `gorm:"primaryKey" json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
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
