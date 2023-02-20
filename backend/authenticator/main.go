package authenticator

import (
	"bultdatabasen/domain"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"gopkg.in/square/go-jose.v2"
)

type contextKey string

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
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
	byteValue, _ := io.ReadAll(keysFile)

	var keyList struct {
		Keys []interface{} `json:"keys"`
	}

	err = json.Unmarshal(byteValue, &keyList)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	for _, jsonKey := range keyList.Keys {
		bytes, _ := json.Marshal(jsonKey)

		k := jose.JSONWebKey{}
		if err := k.UnmarshalJSON(bytes); err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
			os.Exit(1)
		}

		keys.Keys = append(keys.Keys, k)
	}
}

func (a *authenticator) Authenticate(ctx context.Context) (domain.User, error) {
	if user, ok := ctx.Value(contextKey("user")).(domain.User); ok {
		return user, nil
	} else {
		return domain.User{}, domain.ErrNotAuthenticated
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
		return domain.User{}, domain.ErrTokenExpired
	}

	user.ID = claims.Username

	return user, nil
}

func (a *authenticator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var bearer string
		header := r.Header.Get("Authorization")

		for {
			if header == "" {
				break
			}

			if n, err := fmt.Sscanf(header, "Bearer %s", &bearer); err != nil || n != 1 {
				break
			}

			payload, err := a.verifyJWT(bearer)
			if err != nil {
				break
			}

			user, err := a.decodeJWT(payload)
			if err != nil {
				break
			}

			ctx := context.WithValue(r.Context(), contextKey("user"), user)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		next.ServeHTTP(w, r)
		return
	})
}
