package email

import (
	"bultdatabasen/config"
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
)

type emailer struct {
	auth smtp.Auth
	host string
	port int
}

type sendEmailRequest struct {
	recipient string
	subject   string
	body      string
}

func NewMailSender(config config.Config) (*emailer, error) {
	emailer := &emailer{
		auth: smtp.PlainAuth("", config.SMTP.Username, config.SMTP.Password, config.SMTP.Host),
		host: config.SMTP.Host,
		port: config.SMTP.Port,
	}

	return emailer, nil
}

func (e *emailer) SendEmail(ctx context.Context, recipient, subject, body string) error {
	c := make(chan error, 1)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				switch x := r.(type) {
				case string:
					c <- errors.New(x)
				case error:
					c <- x
				default:
					c <- errors.New("unknown panic")
				}
			}
		}()

		c <- e.handleSendEmailRequest(ctx, sendEmailRequest{
			recipient: recipient,
			subject:   subject,
			body:      body,
		})
	}()

	select {
	case <-ctx.Done():
		<-c
		return ctx.Err()
	case err := <-c:
		return err
	}
}

func (e *emailer) handleSendEmailRequest(ctx context.Context, msg sendEmailRequest) error {
	var err error
	from := mail.Address{Name: "Bultdatabasen", Address: "no-reply@bultdatabasen.se"}

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", from.Name, from.Address)
	headers["To"] = msg.recipient
	headers["Subject"] = msg.subject

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + msg.body

	address := e.host + ":" + fmt.Sprintf("%d", e.port)

	dialer := tls.Dialer{
		Config: &tls.Config{
			ServerName: e.host,
		},
	}

	conn, err := dialer.DialContext(ctx, "tcp", address)
	if err != nil {
		return err
	}
	if deadline, ok := ctx.Deadline(); ok {
		if err := conn.SetDeadline(deadline); err != nil {
			return err
		}
	}

	defer conn.Close()

	client, err := smtp.NewClient(conn, e.host)
	if err != nil {
		return err
	}

	if err := client.Auth(e.auth); err != nil {
		return err
	}

	if err = client.Mail(from.Address); err != nil {
		return err
	}

	if err = client.Rcpt(msg.recipient); err != nil {
		return err
	}

	w, err := client.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	err = client.Quit()
	if err != nil {
		return err
	}

	return nil
}
