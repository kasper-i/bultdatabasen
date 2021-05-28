package authorizer

import (
	"bultdatabasen/auth"
	"bultdatabasen/model"
	"bultdatabasen/utils"
	"crypto/rsa"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

type authorizer struct {
}

func New() *authorizer {
	return &authorizer{}
}

type MyCustomClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

var jwtKeys = make(map[string]*rsa.PublicKey, 2)

func init() {
	jwtKeys["gfmWfYBUTrl2CsA+5TzTr1bCO1lQIcYBsDYRviUvKvc="] = convertKey("AQAB", "whA_cKNimWDjUK6eElfabWALj0gVcoUjNwsa_VZkZzvzQJlcIXR_E4qZgPDHVaCgDrPZ1ViViUbrrZpIwUI1scZvUH6ZCJTZYuO0dfyvAIUQavvxak5v-ZzUNrm3sIwyxzs44OZaRxGg6NCthxHtks47YSmfcLniY9iNdkl32zU1HvEd-W6UJrPlrOTDlX564ZnTmdWPX2RFlRouCSBQl66LprzUKX71mE6dca4S7jsnuELK5CLjWkUaZWfmGgSJH38zzZ9eSWttIpTBAYEF81n6PaGBarv2tZgo3SeuwlI3TwXgn_ylRVaiLezLPBTh4H_WqkEeDE30NqeOMBMM1Q")
	jwtKeys["P4lcFQ/F2RpTTQy0dEGefnbJkRw4n56TVRBoHBix194="] = convertKey("AQAB", "7P8wQGwo6hiGn6ocDl-YQd4QxMGwPFbC2BSdQlqELTkR-389Cdi975V1HsebrMTeDAc07Bw2Hum-pF0yG1b8vr4WpX6U4zU1MiRZDj28_uybZHYtURQb5PvHenoW7INQImw2gY4OTmcbf59S3YlHhTffIngGHjp2y0L2JeaO5IbUT6sCtzqlhuYkMaeSF_P6Zbmthp2KXP2XXXFE_oIUKv-KNpol6MZ9NMIkXBZem_epKn8SL02rUX64yxH1Hu6w4R8c5mYjo97lD3itHAlSpdr1P8TVSPS5k0Pd3rZAqWd4FKa32hlOJywb30XcT7FIYn4bMyGtM_d4YBD3jPDBhw")
}

func convertKey(rawE, rawN string) *rsa.PublicKey {
	decodedE, err := base64.RawURLEncoding.DecodeString(rawE)
	if err != nil {
		panic(err)
	}
	if len(decodedE) < 4 {
		ndata := make([]byte, 4)
		copy(ndata[4-len(decodedE):], decodedE)
		decodedE = ndata
	}
	pubKey := &rsa.PublicKey{
		N: &big.Int{},
		E: int(binary.BigEndian.Uint32(decodedE[:])),
	}
	decodedN, err := base64.RawURLEncoding.DecodeString(rawN)
	if err != nil {
		panic(err)
	}
	pubKey.N.SetBytes(decodedN)
	return pubKey
}

func authenticate(tokenString string) (string, error) {
	var userId string

	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if kid, ok := token.Header["kid"]; ok {
			if key, found := jwtKeys[kid.(string)]; found {
				return key, nil
			}

			return nil, fmt.Errorf("no key found for kid %v", kid)
		}

		return nil, errors.New("no kid")
	})

	if err != nil {
		return userId, nil
	}

	if claims, ok := token.Claims.(*MyCustomClaims); ok && token.Valid {
		userId := claims.Username
		return userId, nil
	} else {
		return userId, claims.Valid()
	}
}

func (authorizer *authorizer) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		resourceID := vars["resourceID"]
		var userId string
		var err error

		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		if r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		if auth := r.Header.Get("Authorization"); auth == "" {
			writeForbidden(w, resourceID)
			return
		} else {
			var tokenString string
			if n, err := fmt.Sscanf(auth, "Bearer %s", &tokenString); n == 1 && err == nil {
				if userId, err = authenticate(tokenString); err != nil {
					writeUnauthorized(w, resourceID)
					return
				}
			} else {
				writeUnauthorized(w, resourceID)
				return
			}
		}

		if r.Method == "GET" && r.URL.Path == "/users/myself" {
			next.ServeHTTP(w, r)
			return
		}

		if (r.Method == "GET" || r.Method == "POST") && r.URL.Path == "/areas" {
			next.ServeHTTP(w, r)
			return
		}

		if resourceID == model.RootID {
			writeForbidden(w, resourceID)
			return
		}

		roles := auth.GetRoles(model.DB, userId)

		for _, role := range roles {
			if role.ResourceID == resourceID {
				next.ServeHTTP(w, r)
				return
			}
		}

		var ancestors []model.Resource

		if ancestors, err = model.GetAncestors(model.DB, resourceID); err != nil {
			writeForbidden(w, resourceID)
			return
		}

		for _, ancestor := range ancestors {
			for _, role := range roles {
				if role.ResourceID == ancestor.ID {
					next.ServeHTTP(w, r)
					return
				}
			}
		}

		writeForbidden(w, resourceID)
	})
}

func writeForbidden(w http.ResponseWriter, resourceID string) {
	err := utils.Error{
		Status:     http.StatusForbidden,
		Message:    "Forbidden",
		ResourceID: &resourceID,
	}

	w.WriteHeader(http.StatusForbidden)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(err)
}

func writeUnauthorized(w http.ResponseWriter, resourceID string) {
	err := utils.Error{
		Status:  http.StatusUnauthorized,
		Message: "Unauthorized",
	}

	w.WriteHeader(http.StatusUnauthorized)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(err)
}
