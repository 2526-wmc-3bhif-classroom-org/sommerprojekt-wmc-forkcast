// Decouples the low-level api-connector from the auth-service/stores it would
// otherwise import (which would form a cycle, since those import the connector).
// A client plugin registers the handler; the connector just triggers it.
let handler: (() => void | Promise<void>) | null = null;

export function onAuthExpiry(fn: () => void | Promise<void>) {
    handler = fn;
}

export function triggerAuthExpiry() {
    void handler?.();
}
