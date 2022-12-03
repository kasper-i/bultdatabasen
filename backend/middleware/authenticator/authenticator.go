package authenticator

import (
	"bultdatabasen/utils"
	"context"
	"encoding/json"
	"errors"
	"fmt"
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
}

var keys jose.JSONWebKeySet

func init() {
	j1 := []byte(`{"alg":"RS256","e":"AQAB","kid":"P4lcFQ/F2RpTTQy0dEGefnbJkRw4n56TVRBoHBix194=","kty":"RSA","n":"7P8wQGwo6hiGn6ocDl-YQd4QxMGwPFbC2BSdQlqELTkR-389Cdi975V1HsebrMTeDAc07Bw2Hum-pF0yG1b8vr4WpX6U4zU1MiRZDj28_uybZHYtURQb5PvHenoW7INQImw2gY4OTmcbf59S3YlHhTffIngGHjp2y0L2JeaO5IbUT6sCtzqlhuYkMaeSF_P6Zbmthp2KXP2XXXFE_oIUKv-KNpol6MZ9NMIkXBZem_epKn8SL02rUX64yxH1Hu6w4R8c5mYjo97lD3itHAlSpdr1P8TVSPS5k0Pd3rZAqWd4FKa32hlOJywb30XcT7FIYn4bMyGtM_d4YBD3jPDBhw","use":"sig"}`)
	j2 := []byte(`{"alg":"RS256","e":"AQAB","kid":"gfmWfYBUTrl2CsA+5TzTr1bCO1lQIcYBsDYRviUvKvc=","kty":"RSA","n":"whA_cKNimWDjUK6eElfabWALj0gVcoUjNwsa_VZkZzvzQJlcIXR_E4qZgPDHVaCgDrPZ1ViViUbrrZpIwUI1scZvUH6ZCJTZYuO0dfyvAIUQavvxak5v-ZzUNrm3sIwyxzs44OZaRxGg6NCthxHtks47YSmfcLniY9iNdkl32zU1HvEd-W6UJrPlrOTDlX564ZnTmdWPX2RFlRouCSBQl66LprzUKX71mE6dca4S7jsnuELK5CLjWkUaZWfmGgSJH38zzZ9eSWttIpTBAYEF81n6PaGBarv2tZgo3SeuwlI3TwXgn_ylRVaiLezLPBTh4H_WqkEeDE30NqeOMBMM1Q","use":"sig"}`)

	k1 := jose.JSONWebKey{}
	if err := k1.UnmarshalJSON(j1); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	k2 := jose.JSONWebKey{}
	if err := k2.UnmarshalJSON(j2); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}

	keys.Keys = append(keys.Keys, k1)
	keys.Keys = append(keys.Keys, k2)
}

func authenticate(rawJWT string) (string, error) {
	var userID string

	signature, err := jose.ParseSigned(rawJWT)
	if err != nil {
		return userID, err
	}

	kid := signature.Signatures[0].Header.KeyID
	payload, err := signature.Verify(keys.Key(kid)[0].Key)
	if err != nil {
		return userID, err
	}

	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return userID, err
	} else if time.Unix(claims.Expiration, 0).Before(time.Now()) {
		return userID, errors.New("JWT is expired")
	} else {
		userID = claims.Username
	}

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
