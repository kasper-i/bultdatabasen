package domain

import "context"

type EmailSender interface {
	SendEmail(ctx context.Context, recipient, subject, body string) error
}
