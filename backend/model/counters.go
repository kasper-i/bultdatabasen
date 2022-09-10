package model

import (
	"database/sql/driver"
	"encoding/json"
)

type CounterType string

const (
	OpenTasks CounterType = "openTasks"
	InstalledBolts CounterType = "installedBolts"
)

type Counters struct {
	OpenTasks int `json:"openTasks,omitEmpty"`
	InstalledBolts int `json:"installedBolts,omitEmpty"`
}

func (lhs Counters) Substract(rhs Counters) Counters {
	copy := lhs

	copy.OpenTasks -= rhs.OpenTasks
	copy.InstalledBolts -= rhs.InstalledBolts

	return copy
}

func (lhs Counters) Add(rhs Counters) Counters {
	copy := lhs

	copy.OpenTasks += rhs.OpenTasks
	copy.InstalledBolts += rhs.InstalledBolts

	return copy
}

func (counters *Counters) IsZero() bool {
	return counters.OpenTasks == 0
}

func (counters *Counters) Scan(value interface{}) error {
	bytes := value.([]byte)
	err := json.Unmarshal(bytes, counters)
	return err
}

func (counters Counters) Value() (driver.Value, error) {
	return json.Marshal(counters)
}

func (counters *Counters) AsMap() map[CounterType]int {
	var dict map[CounterType]int = make(map[CounterType]int, 0)

	if counters.OpenTasks != 0 {
		dict[OpenTasks] = counters.OpenTasks
	}

	if counters.InstalledBolts != 0 {
		dict[InstalledBolts] = counters.InstalledBolts
	}

	return dict
}

