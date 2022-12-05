package model

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     *string   `json:"email,omitempty"`
	FirstName *string   `json:"firstName,omitempty"`
	LastName  *string   `json:"lastName,omitempty"`
	FirstSeen time.Time `json:"firstSeen,omitempty"`
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

func (sess Session) GetUserNames() ([]User, error) {
	var names []User = make([]User, 0)

	if err := sess.DB.Raw(`SELECT id, first_name, SUBSTRING(last_name, 1, 1) AS last_name FROM "user"`).
		Scan(&names).Error; err != nil {
		return names, err
	}

	return names, nil
}
