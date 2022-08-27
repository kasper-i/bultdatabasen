package model

import (
	"fmt"
	"os"
)

type CounterType string

const (
	OpenTasks CounterType = "openTasks"
)

var AllCounterTypes []CounterType = []CounterType{
	OpenTasks,
}

type Counters struct {
	OpenTasks *int `json:"openTasks"`
}

type UpdateCounterMsg struct {
	ResourceID  string
	CounterType CounterType
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
		select {
		case msg := <-channel:
			err := handler(msg)
			if err != nil {
				fmt.Fprintf(os.Stderr, "%v\n", err)
			}
		}
	}
}

func handler(msg UpdateCounterMsg) error {
	sess := createSession()
	var newCount int

	resource, err := sess.GetResource(msg.ResourceID)
	if err != nil {
		return err
	}

	ancestors, err := sess.GetAncestorsWithCounters(msg.ResourceID)
	if err != nil {
		return err
	}

	switch msg.CounterType {
	case OpenTasks:
		newCount, err = sess.CountOpenTasks(msg.ResourceID)
		if err != nil {
			return err
		}
	}

	difference := newCount - resource.Counters.GetCount(msg.CounterType)

	err = sess.Transaction(func(sess Session) error {
		if err := sess.UpdateCount(msg.ResourceID, msg.CounterType, newCount); err != nil {
			return err
		}

		for _, ancestor := range ancestors {
			newAncestorCount := ancestor.Counters.GetCount(msg.CounterType) + difference

			if err := sess.UpdateCount(ancestor.ID, msg.CounterType, newAncestorCount); err != nil {
				return err
			}
		}

		return nil
	})

	return nil
}

func UpdateCounter(message UpdateCounterMsg) {
	channel <- message
}
