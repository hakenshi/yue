type EventHandler<T = unknown> = (data: T) => void

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    const set = this.handlers.get(event)!
    set.add(handler as EventHandler)
    return () => set.delete(handler as EventHandler)
  }

  emit<T>(event: string, data: T) {
    const set = this.handlers.get(event)
    if (set) {
      for (const handler of set) {
        handler(data)
      }
    }
  }

  off(event: string) {
    this.handlers.delete(event)
  }

  clear() {
    this.handlers.clear()
  }
}

export const bus = new EventBus()
