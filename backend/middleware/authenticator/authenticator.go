package authenticator

import (
	"bultdatabasen/utils"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"gopkg.in/square/go-jose.v2"
)

type authenticator struct {
}

func New() *authenticator {
	return &authenticator{}
}

var (
	ErrTokenExpired     = errors.New("Token is expired")
	ErrUnexpectedIssuer = errors.New("Unexpected issuer")
)

func IsPublic(r *http.Request) bool {
	if r.Method == "OPTIONS" {
		return true
	}

	if r.Method == "GET" || r.Method == "HEAD" {
		switch {
		case r.URL.Path == "/health":
			return true
		case r.URL.Path == "/version":
			return true
		case strings.HasPrefix(r.URL.Path, "/resources"):
			return true
		case strings.HasPrefix(r.URL.Path, "/areas"):
			return true
		case strings.HasPrefix(r.URL.Path, "/crags"):
			return true
		case strings.HasPrefix(r.URL.Path, "/sectors"):
			return true
		case strings.HasPrefix(r.URL.Path, "/routes"):
			return true
		case strings.HasPrefix(r.URL.Path, "/points"):
			return true
		case strings.HasPrefix(r.URL.Path, "/bolts"):
			return true
		case strings.HasPrefix(r.URL.Path, "/images"):
			return true
		case strings.HasPrefix(r.URL.Path, "/tasks"):
			return true
		case strings.HasPrefix(r.URL.Path, "/materials"):
			return true
		case strings.HasPrefix(r.URL.Path, "/manufacturers"):
			return true
		case r.URL.Path == "/users/names":
			return true
		}
	}

	return false
}

type Claims struct {
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

func authenticate(rawJWT string) (string, error) {
	var userID string

	signature, err := jose.ParseSigned(rawJWT)
	if err != nil {
		return userID, err
	}

	kid := signature.Signatures[0].Header.KeyID
	var key interface{}
	if result := keys.Key(kid); len(result) == 1 {
		key = result[0].Key
	} else {
		return userID, ErrUnexpectedIssuer
	}

	payload, err := signature.Verify(key)
	if err != nil {
		return userID, err
	}

	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return userID, err
	}

	if time.Unix(claims.Expiration, 0).Before(time.Now()) {
		return userID, ErrTokenExpired
	}

	userID = claims.Username

	return userID, nil
}

func getUserID(r *http.Request) *string {
	if auth := r.Header.Get("Authorization"); auth == "" {
		return nil
	} else {
		var tokenString string

		if n, err := fmt.Sscanf(auth, "Bearer %s", &tokenString); err != nil || n != 1 {
			return nil
		}

		if userID, err := authenticate(tokenString); err != nil {
			return nil
		} else {
			return &userID
		}
	}
}

func (authorizer *authenticator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := getUserID(r)
		var ctx context.Context

		if userID != nil {
			ctx = context.WithValue(r.Context(), "user_id", *userID)
		} else {
			ctx = r.Context()
		}

		if IsPublic(r) {
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		if userID == nil {
			writeUnauthorized(w)
		} else {
			next.ServeHTTP(w, r.WithContext(ctx))
		}
	})
}

func writeUnauthorized(w http.ResponseWriter) {
	err := utils.Error{
		Status:  http.StatusUnauthorized,
		Message: "Unauthorized",
	}

	w.WriteHeader(http.StatusUnauthorized)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(err)
}
