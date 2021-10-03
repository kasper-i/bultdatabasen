package model

import (
	"time"
)

type User struct {
	ID       string    `gorm:"primaryKey" json:"id"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
	JoinDate time.Time `json:"joinDate"`
}

func (User) TableName() string {
	return "user"
}

func (sess Session) GetUser(userID string) (*User, error) {
	var user User

	if err := sess.DB.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (sess Session) UpdateUser(user *User) error {
	if err := sess.DB.Save(&user).Error; err != nil {
		return err
	}

	return nil
}

func (sess Session) CreateUser(user *User) error {
	if err := sess.DB.Create(&user).Error; err != nil {
		return err
	}

	return nil
}
