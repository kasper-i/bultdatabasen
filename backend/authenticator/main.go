package authenticator

import (
	"bultdatabasen/domain"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"gopkg.in/square/go-jose.v2"
)

type contextKey struct{}

type authenticationResult struct {
	user domain.User
	err  error
}

type authenticator struct {
}

func New() *authenticator {
	return &authenticator{}
}

type claims struct {
	Username   string `json:"username"`
	Expiration int64  `json:"exp"`
	Issuer     string `json:"iss"`
}

var keys jose.JSONWebKeySet

func init() {
	keysFile, err := os.Open("/etc/bultdatabasen/keys.json")
	if err != nil {
		log.Fatalf("%v\n", err)
	}
	byteValue, _ := io.ReadAll(keysFile)

	var keyList struct {
		Keys []interface{} `json:"keys"`
	}

	err = json.Unmarshal(byteValue, &keyList)
	if err != nil {
		log.Fatalf("%v\n", err)
	}

	for _, jsonKey := range keyList.Keys {
		bytes, _ := json.Marshal(jsonKey)

		k := jose.JSONWebKey{}
		if err := k.UnmarshalJSON(bytes); err != nil {
			log.Fatalf("%v\n", err)
		}

		keys.Keys = append(keys.Keys, k)
	}
}

func (a *authenticator) Authenticate(ctx context.Context) (domain.User, error) {
	if result, ok := ctx.Value(contextKey{}).(authenticationResult); ok {
		return result.user, result.err
	} else {
		return domain.User{}, &domain.ErrNotAuthenticated{}
	}
}

func (a *authenticator) verifyJWT(jwt string) ([]byte, error) {
	signature, err := jose.ParseSigned(jwt)
	if err != nil {
		return nil, err
	}

	kid := signature.Signatures[0].Header.KeyID
	var key interface{}
	if result := keys.Key(kid); len(result) == 1 {
		key = result[0].Key
	} else {
		return nil, domain.ErrUnexpectedIssuer
	}

	payload, err := signature.Verify(key)
	if err != nil {
		return nil, err
	}

	return payload, nil
}

func (a *authenticator) decodeJWT(payload []byte) (domain.User, error) {
	var user domain.User
	var claims claims

	if err := json.Unmarshal(payload, &claims); err != nil {
		return domain.User{}, err
	}

	if time.Unix(claims.Expiration, 0).Before(time.Now()) {
		return domain.User{}, &domain.ErrNotAuthenticated{
			Reason: "token expired",
		}
	}

	user.ID = claims.Username

	return user, nil
}

func (a *authenticator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var bearer string
		var payload []byte
		var user domain.User
		var err error
		header := r.Header.Get("Authorization")

		ctx := r.Context()

		if header == "" {
			goto done
		}

		if n, err := fmt.Sscanf(header, "Bearer %s", &bearer); err != nil || n != 1 {
			goto done
		}

		payload, err = a.verifyJWT(bearer)
		if err != nil {
			ctx = context.WithValue(ctx, contextKey{}, authenticationResult{user: domain.User{}, err: err})
			goto done
		}

		user, err = a.decodeJWT(payload)
		ctx = context.WithValue(ctx, contextKey{}, authenticationResult{user: user, err: err})

	done:
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
