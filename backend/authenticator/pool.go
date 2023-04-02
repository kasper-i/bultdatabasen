package authenticator

import (
	"bultdatabasen/config"
	"bultdatabasen/domain"
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

type pool struct {
	comm       chan any
	provider   *cognitoidentityprovider.CognitoIdentityProvider
	userPoolID string
}

type getUserRequest struct {
	userID       string
	replyChannel chan getUserResponse
}

type getUserResponse struct {
	user domain.User
	err  error
}

type fetchUserResult struct {
	userID string
	user   domain.User
	err    error
}

type userObservers struct {
	notificationChannels []chan getUserResponse
}

func NewUserPool(config config.Config) domain.UserPool {
	session := session.Must(session.NewSession(&aws.Config{
		Region:      aws.String(config.Cognito.Region),
		Credentials: credentials.NewStaticCredentials(config.Cognito.AccessKey, config.Cognito.SecretAccessKey, ""),
	}))
	provider := cognitoidentityprovider.New(session)

	pool := &pool{
		comm:       make(chan any),
		provider:   provider,
		userPoolID: config.Cognito.UserPoolID,
	}

	go pool.main()

	return pool
}

func (pool *pool) GetUser(ctx context.Context, userID string) (domain.User, error) {
	replyChannel := make(chan getUserResponse)
	pool.comm <- getUserRequest{
		userID:       userID,
		replyChannel: replyChannel,
	}

	select {
	case <-ctx.Done():
		return domain.User{}, ctx.Err()
	case response := <-replyChannel:
		return response.user, response.err
	}
}

func (pool *pool) main() {
	users := make(map[string]domain.User)
	observers := make(map[string]*userObservers)

	for msg := range pool.comm {
		switch msg := msg.(type) {
		case fetchUserResult:
			if msg.err == nil {
				users[msg.userID] = msg.user
			}
			if p, exist := observers[msg.userID]; exist {
				for _, c := range p.notificationChannels {
					c <- getUserResponse{
						user: msg.user,
						err:  msg.err,
					}
				}

				delete(observers, msg.userID)
			}
		case getUserRequest:
			if user, ok := users[msg.userID]; ok {
				msg.replyChannel <- getUserResponse{
					user: user,
				}
			} else if p, exist := observers[msg.userID]; exist {
				p.notificationChannels = append(p.notificationChannels, msg.replyChannel)
			} else {
				observers[msg.userID] = &userObservers{
					notificationChannels: []chan getUserResponse{msg.replyChannel},
				}
				go pool.fetchUser(msg.userID)
			}
		}
	}
}

func (pool *pool) fetchUser(userID string) {
	defer func() {
		if err := recover(); err != nil {
			pool.comm <- fetchUserResult{
				userID: userID,
				err:    fmt.Errorf("%v", err),
			}
		}
	}()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cognitoUser, err := pool.provider.AdminGetUserWithContext(ctx, &cognitoidentityprovider.AdminGetUserInput{
		UserPoolId: aws.String(pool.userPoolID),
		Username:   aws.String(userID),
	})

	if err != nil {
		pool.comm <- fetchUserResult{
			userID: userID,
			err:    err,
		}
		return
	}

	user := domain.User{
		ID:        *cognitoUser.Username,
		FirstSeen: *cognitoUser.UserCreateDate,
	}

	for _, attribute := range cognitoUser.UserAttributes {
		switch *attribute.Name {
		case "email":
			user.Email = attribute.Value
		case "given_name":
			user.FirstName = attribute.Value
		case "family_name":
			user.LastName = attribute.Value
		}
	}

	pool.comm <- fetchUserResult{
		userID: userID,
		user:   user,
	}
}
