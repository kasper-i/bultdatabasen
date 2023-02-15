package domain

import (
	"errors"

	"github.com/google/uuid"
)

type ErrNotAuthorized struct {
	ResourceID uuid.UUID
	Permission PermissionType
}

func (err *ErrNotAuthorized) Error() string {
	return "not authorized"
}

type ErrResourceNotFound struct {
	ResourceID uuid.UUID
}

func (err *ErrResourceNotFound) Error() string {
	return "resource not found"
}

var (
	ErrTokenExpired        = errors.New("token expired")
	ErrUnexpectedIssuer    = errors.New("unexpected issuer")
	ErrNotAuthenticated    = errors.New("not authenticated")
	ErrUnsupportedMimeType = errors.New("unsupported MIME type")
	ErrNonOrthogonalAngle  = errors.New("non-orthogonal angle")
	ErrUnmovableResource   = errors.New("unmovable resource")
	ErrOperationRefused    = errors.New("operation refused")
	ErrIllegalParent       = errors.New("illegal parent")
	ErrVacantPoint         = errors.New("vacant point")
	ErrInvariantViolation  = errors.New("invariant violation")
	ErrBadInsertPosition   = errors.New("bad insert position")
)
