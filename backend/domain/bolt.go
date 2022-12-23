package domain

import "time"

type Bolt struct {
	ResourceBase
	Type           *string    `json:"type,omitempty"`
	Position       *string    `json:"position,omitempty"`
	Installed      *time.Time `json:"installed,omitempty"`
	Dismantled     *time.Time `json:"dismantled,omitempty"`
	ManufacturerID *string    `json:"manufacturerId,omitempty"`
	Manufacturer   *string    `gorm:"->" json:"manufacturer,omitempty"`
	ModelID        *string    `json:"modelId,omitempty"`
	Model          *string    `gorm:"->" json:"model,omitempty"`
	MaterialID     *string    `json:"materialId,omitempty"`
	Material       *string    `gorm:"->" json:"material,omitempty"`
	Diameter       *float32   `json:"diameter,omitempty"`
	DiameterUnit   *string    `json:"diameterUnit,omitempty"`
}

func (Bolt) TableName() string {
	return "bolt"
}

func (bolt *Bolt) UpdateCounters() {
	if bolt.Dismantled == nil {
		bolt.Counters.InstalledBolts = 1
	} else {
		bolt.Counters.InstalledBolts = 0
	}
}
