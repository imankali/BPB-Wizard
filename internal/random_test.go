package internal

import (
	"strings"
	"testing"
)

func TestRandomStringBoundsAndAlphabet(t *testing.T) {
	for i := 0; i < 100; i++ {
		value := randString("abc123", 16, 32)
		if len(value) < 16 || len(value) > 32 {
			t.Fatalf("unexpected length: %d", len(value))
		}
		for _, char := range value {
			if !strings.ContainsRune("abc123", char) {
				t.Fatalf("unexpected character: %q", char)
			}
		}
	}
}

func TestRandomIntBounds(t *testing.T) {
	if randInt(7, 7) != 7 {
		t.Fatal("fixed range must return its only value")
	}
	for i := 0; i < 100; i++ {
		value := randInt(0, 10)
		if value < 0 || value > 10 {
			t.Fatalf("out of range: %d", value)
		}
	}
}
