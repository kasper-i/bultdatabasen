package domain

import "context"

type EmailSender interface {
	SendEmail(ctx context.Context, recipient string, subject string, body string) error
}
