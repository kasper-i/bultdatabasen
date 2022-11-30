package utils

import (
	"errors"
)

var (
	ErrNotPermitted                = errors.New("Operation not permitted")
	ErrHierarchyStructureViolation = errors.New("Hierarchy violation")
	ErrOrphanedResource            = errors.New("Orphaned resource")
	ErrMissingAttachmentPoint      = errors.New("Missing attachment point")
	ErrInvalidAttachmentPoint      = errors.New("Invalid attachment point")
	ErrLoopDetected                = errors.New("Loop detected")
	ErrCorruptResource             = errors.New("Corrupt resource")
	ErrMoveNotPermitted            = errors.New("Not permitted to move resource")
)
