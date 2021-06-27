package utils

import (
	"errors"
)

var (
	ErrIllegalChildResource = errors.New("Illegal child")
	ErrIllegalParentResource = errors.New("Illegal parent")
	ErrMissingParent = errors.New("Missing parent")
)
