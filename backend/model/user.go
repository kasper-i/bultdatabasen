package model

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     *string   `json:"email,omitempty"`
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	FirstSeen time.Time `json:"firstSeen"`
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
	return sess.DB.Save(&user).Error
}

func (sess Session) CreateUser(user *User) error {
	return sess.DB.Create(&user).Error
}
