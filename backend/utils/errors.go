package utils

import (
	"errors"
)

var (
	ErrHierarchyStructureViolation = errors.New("Hierarchy violation")
	ErrOrphanedResource            = errors.New("Orphaned resource")
	ErrMissingAttachmentPoint      = errors.New("Missing attachment point")
	ErrInvalidAttachmentPoint      = errors.New("Invalid attachment point")
	ErrLoopDetected                = errors.New("Loop detected")
	ErrCorruptResource             = errors.New("Corrupt resource")
)
