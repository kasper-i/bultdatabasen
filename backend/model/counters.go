package model

import (
	"database/sql/driver"
	"encoding/json"
)

type CounterType string

const (
	OpenTasks CounterType = "openTasks"
)

type Counters struct {
	OpenTasks int `json:"openTasks,omitEmpty"`
}

func (lhs Counters) Substract(rhs Counters) Counters {
	copy := lhs

	copy.OpenTasks -= rhs.OpenTasks

	return copy
}

func (lhs Counters) Add(rhs Counters) Counters {
	copy := lhs

	copy.OpenTasks += rhs.OpenTasks

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

	return dict
}

