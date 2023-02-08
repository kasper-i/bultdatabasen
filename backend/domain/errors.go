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

type ErrImageSizeNotAvailable struct {
	ImageID uuid.UUID
	Size    string
}

func (err *ErrImageSizeNotAvailable) Error() string {
	return "image size not available"
}

var (
	ErrTokenExpired                = errors.New("token is expired")
	ErrUnexpectedIssuer            = errors.New("unexpected issuer")
	ErrNotAuthenticated            = errors.New("not authenticated")
	ErrIllegalAngle                = errors.New("illegal image rotation angle")
	ErrUnknownImageSize            = errors.New("unknown image size")
	ErrIllegalInsertPosition       = errors.New("illegal point insert position")
	ErrPointWithoutBolts           = errors.New("point without bolts")
	ErrUnsupportedMimeType         = errors.New("unsupported MIME type")
	ErrNotPermitted                = errors.New("operation not permitted")
	ErrHierarchyStructureViolation = errors.New("hierarchy violation")
	ErrOrphanedResource            = errors.New("orphaned resource")
	ErrMissingAttachmentPoint      = errors.New("missing attachment point")
	ErrInvalidAttachmentPoint      = errors.New("invalid attachment point")
	ErrLoopDetected                = errors.New("loop detected")
	ErrCorruptResource             = errors.New("corrupt resource")
	ErrMoveNotPermitted            = errors.New("not permitted to move resource")
)
