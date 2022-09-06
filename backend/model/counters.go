package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"os"
)

type CounterType string
type TriggerEvent string

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

const (
	UpdateResource TriggerEvent = "UPDATE"
	DeleteResource TriggerEvent = "DELETE"
)

type UpdateCounterMsg struct {
	ResourceID  string
	TriggerEvent TriggerEvent
	CounterType *CounterType
}

var channel chan UpdateCounterMsg

func createSession() Session {
	return NewSession(DB, nil)
}

func init() {
	channel = make(chan UpdateCounterMsg)
	go run()
}

func run() {
	for {
		msg := <-channel

		err := handler(msg)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
		}
	}
}

func handler(msg UpdateCounterMsg) error {
	defer func() {
		if err := recover(); err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
		}	
	}()

	sess := createSession()

	resource, err := sess.GetResource(msg.ResourceID)
	if err != nil {
		return err
	}

	ancestors, err := sess.GetAllAncestorsWithCounters(msg.ResourceID)
	if err != nil {
		return err
	}

	switch msg.TriggerEvent {
	case DeleteResource:
		return deleteCounters(sess, resource.Counters, ancestors)
	case UpdateResource:
		return updateCounters(sess, *resource, ancestors, *msg.CounterType)
	}

	return nil
}

func deleteCounters(sess Session, counters Counters, ancestors []Resource) error {
	return sess.Transaction(func(sess Session) error {
		for _, ancestor := range ancestors {
			if err := sess.UpdateCount(ancestor, ancestor.Counters.Substract(counters)); err != nil {
				return err
			}
		}

		return nil
	})
}

func updateCounters(sess Session, resource Resource, ancestors []Resource, counterType CounterType) error {
	difference := Counters{}

	switch counterType {
	case OpenTasks:
		if isOpen, err := sess.IsTaskOpen(resource.ID); err != nil {
			return err
		} else {
			count := 0
			if isOpen {
				count = 1
			}

			difference.OpenTasks = count - resource.Counters.OpenTasks
		}
	}

	if difference.IsZero() {
		return nil
	}

	return sess.Transaction(func(sess Session) error {
		if err := sess.UpdateCount(resource, resource.Counters.Add(difference)); err != nil {
			return err
		}

		for _, ancestor := range ancestors {
			if err := sess.UpdateCount(ancestor, ancestor.Counters.Add(difference)); err != nil {
				return err
			}
		}

		return nil
	})
}

func UpdateCounter(resourceID string, counterType CounterType) {
	channel <- UpdateCounterMsg{
		ResourceID: resourceID,
		TriggerEvent: UpdateResource,
		CounterType: &counterType,
	}
}

func RemoveAllCounters(resourceID string) {
	channel <- UpdateCounterMsg{
		ResourceID: resourceID,
		TriggerEvent: DeleteResource,
	}
}
