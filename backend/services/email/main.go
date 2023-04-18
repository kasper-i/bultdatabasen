package email

import (
	"bultdatabasen/config"
	"crypto/tls"
	"fmt"
	"net/mail"
	"net/smtp"
)

type emailer struct {
	comm chan any
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
		comm: make(chan any, 1024),
		auth: smtp.PlainAuth("", config.SMTP.Username, config.SMTP.Password, config.SMTP.Host),
		host: config.SMTP.Host,
		port: config.SMTP.Port,
	}

	go emailer.main()

	return emailer, nil
}

func (e *emailer) SendEmail(recipient string, subject string, body string) {
	e.comm <- sendEmailRequest{
		recipient: recipient,
		subject:   subject,
		body:      body,
	}
}

func (e *emailer) main() {
	for msg := range e.comm {
		switch msg := msg.(type) {
		case sendEmailRequest:
			err := e.handleSendEmailRequest(msg)
			if err != nil {
				fmt.Println(err.Error())
			}
		}
	}
}

func (e *emailer) handleSendEmailRequest(msg sendEmailRequest) error {
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
	tlsconfig := &tls.Config{
		ServerName: e.host,
	}

	conn, err := tls.Dial("tcp", address, tlsconfig)
	if err != nil {
		return err
	}

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

	client.Quit()

	return nil
}
