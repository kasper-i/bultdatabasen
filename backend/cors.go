package main

import (
	"bultdatabasen/utils"
	"net/http"
)

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Header.Get("Origin") {
		case "http://localhost:3000":
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		case "https://bultdatabasen.se":
			w.Header().Set("Access-Control-Allow-Origin", "https://bultdatabasen.se")
		}

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Length, Accept-Encoding, Authorization, Content-Type")
			utils.WriteResponse(w, http.StatusNoContent, nil)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}
