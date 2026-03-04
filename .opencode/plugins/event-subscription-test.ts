/**
 * OpenCode Plugin - Event Subscription Test
 *
 * Fixes:
 * 1. Use a single SSE consumer (never consume subscription.stream twice)
 * 2. Filter events by test session ID
 * 3. Use promptAsync and wait for message/session completion signals
 * 4. Emit diagnostic context on timeout
 */

const log = async (client, level, message, extra = {}) => {
  await client.app.log({
    body: {
      service: "event-subscription-test",
      level,
      message,
      extra,
    },
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const readError = (error) => {
  if (!error) return { message: "unknown" }
  if (typeof error === "string") return { message: error }
  if (error instanceof Error) return { message: error.message, name: error.name }
  const response = error?.response
  return {
    message: error?.message || String(error),
    name: error?.name,
    status: response?.status,
    url: response?.url,
    raw: JSON.stringify(error),
  }
}

const readEvent = (event) => {
  const type = event?.type || event?.payload?.type || "unknown"
  const properties = event?.properties || event?.payload?.properties || {}
  const sessionID = properties?.sessionID || properties?.info?.sessionID || properties?.part?.sessionID
  return { type, properties, sessionID }
}

export const EventSubscriptionTestPlugin = async ({ project, client, directory, worktree }) => {
  await log(client, "info", "Plugin initialized", {
    project: project?.name || "unknown",
    directory,
    worktree,
  })

  const receivedHooks = []
  const receivedSse = []
  let testSessionID
  const state = {
    connected: false,
    sseEventCount: 0,
    hookEventCount: 0,
    messageSeen: false,
    idleSeen: false,
    errorSeen: false,
    lastEventType: "none",
    lastEventSessionID: "none",
  }

  const observe = async (source, parsed) => {
    state.lastEventType = parsed.type
    state.lastEventSessionID = parsed.sessionID || "none"

    if (parsed.type === "server.connected") {
      state.connected = true
      if (source === "sse") {
        await log(client, "info", "SSE connection established", {
          eventType: parsed.type,
          eventCount: state.sseEventCount,
        })
      }
      return
    }

    if (!testSessionID) return
    if (parsed.sessionID && parsed.sessionID !== testSessionID) return

    if (source === "sse") receivedSse.push(parsed.type)
    if (source === "hook") receivedHooks.push(parsed.type)

    if (source === "sse") {
      await log(client, "info", `[SSE] ${parsed.type}`, {
        sessionID: parsed.sessionID || "none",
        eventCount: state.sseEventCount,
      })
    }

    if (source === "hook") {
      await log(client, "info", `[HOOK] ${parsed.type}`, {
        sessionID: parsed.sessionID || "none",
        eventCount: state.hookEventCount,
      })
    }

    if (parsed.type === "message.updated" && parsed.properties?.info?.role === "assistant") {
      state.messageSeen = true
    }

    if (parsed.type === "message.part.updated" && parsed.properties?.part?.type === "text") {
      state.messageSeen = true
    }

    if (parsed.type === "session.idle") {
      state.idleSeen = true
    }

    if (parsed.type === "session.status" && parsed.properties?.status?.type === "idle") {
      state.idleSeen = true
    }

    if (parsed.type === "session.error") {
      state.errorSeen = true
    }
  }

  ;(async () => {
    await log(client, "info", "Starting event subscription test...")

    const abort = new AbortController()

    await log(client, "info", "Step 1: Subscribing to events via client.event.subscribe()...")
    const subscription = await client.event.subscribe({ signal: abort.signal })

    const sseConsumer = (async () => {
      for await (const event of subscription.stream) {
        const parsed = readEvent(event)
        state.sseEventCount += 1
        await observe("sse", parsed)
      }
    })().catch(async (error) => {
      if (abort.signal.aborted) return
      await log(client, "error", "SSE consumer failed", {
        error: error?.message || String(error),
      })
    })

    await Promise.race([sleep(2000), (async () => {
      while (!state.connected) await sleep(50)
    })()])

    if (!state.connected) {
      await log(client, "warn", "SSE connection not confirmed within 2s")
    }

    await log(client, "info", "Step 2: Creating session...")
    const session = await client.session.create()
    testSessionID = session?.data?.id

    if (!testSessionID) {
      await log(client, "error", "Session creation failed", { error: session?.error })
      abort.abort()
      await sseConsumer
      return
    }

    await log(client, "info", "Session created", { sessionID: testSessionID })

    await log(client, "info", "Step 3: Sending test message via promptAsync...")

    const send = client.session.promptAsync
      ? client.session.promptAsync({
          path: { id: testSessionID },
          body: {
            parts: [{ type: "text", text: "Hello! Reply briefly: Plugin test OK." }],
          },
        })
      : client.session.prompt({
          path: { id: testSessionID },
          body: {
            parts: [{ type: "text", text: "Hello! Reply briefly: Plugin test OK." }],
          },
        })

    const sendResult = await send.catch((error) => ({ error }))
    if (sendResult?.error) {
      await log(client, "error", "Send message failed", {
        error: readError(sendResult.error),
      })
    }

    await log(client, "info", "Step 4: Waiting for reply events (60s timeout)...")

    const start = Date.now()
    while (Date.now() - start < 60000) {
      if (state.errorSeen) break
      if (state.messageSeen && state.idleSeen) break
      await sleep(100)
    }

    const timedOut = !(state.errorSeen || (state.messageSeen && state.idleSeen))
    if (timedOut) {
      await log(client, "warn", "Timeout waiting for reply lifecycle", {
        sessionID: testSessionID,
        messageSeen: state.messageSeen,
        idleSeen: state.idleSeen,
        errorSeen: state.errorSeen,
        sseEventCount: state.sseEventCount,
        lastEventType: state.lastEventType,
        lastEventSessionID: state.lastEventSessionID,
      })
    }

    await log(client, "info", "Step 5: Cleanup...")
    const del = await client.session.delete({ path: { id: testSessionID } }).catch((error) => ({ error }))
    if (del?.error) {
      await log(client, "warn", "Delete failed", {
        error: readError(del.error),
      })
    }

    abort.abort()
    await sseConsumer

    await log(client, "info", "Test completed", {
      sessionID: testSessionID,
      sseEvents: state.sseEventCount,
      hookEvents: state.hookEventCount,
      sseTypes: [...new Set(receivedSse)].join(",") || "none",
      hooksReceived: [...new Set(receivedHooks)].join(",") || "none",
      messageSeen: state.messageSeen,
      idleSeen: state.idleSeen,
      errorSeen: state.errorSeen,
      timedOut,
    })
  })().catch(async (error) => {
    await log(client, "error", "Background test failed", {
      error: error?.message || String(error),
    })
  })

  return {
    event: async ({ event }) => {
      const parsed = readEvent(event)
      state.hookEventCount += 1
      await observe("hook", parsed)
    },

    "file.edited": async () => {
      receivedHooks.push("file.edited")
    },
  }
}
