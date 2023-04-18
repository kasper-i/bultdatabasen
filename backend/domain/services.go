package domain

type EmailSender interface {
	SendEmail(recipient string, subject string, body string)
}
