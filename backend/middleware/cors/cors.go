package cors

import (
	"bultdatabasen/utils"
	"net/http"
)

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Header.Get("Origin") {
		case "http://localhost:3000":
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			break
		case "https://bultdatabasen.se":
			w.Header().Set("Access-Control-Allow-Origin", "https://bultdatabasen.se")
			break
		}

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			utils.WriteResponse(w, http.StatusNoContent, nil)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}
