/**
 * OpenCode SDK Comprehensive Test
 * 
 * Combined test: session + events + message sending
 * Demonstrates receiving message events via client.event.subscribe()
 * 
 * Usage: bun run start
 */

import { createOpencodeClient } from "@opencode-ai/sdk/v2"
import { title } from "node:process"

const SERVER_URL = process.env.OPENCODE_SERVER_URL || "http://localhost:4096"
const PROJECT_DIR = process.env.OPENCODE_PROJECT_DIR || process.cwd()

console.log("╔═══════════════════════════════════════════════════════════╗")
console.log("║     OpenCode SDK - Comprehensive Test                     ║")
console.log("╚═══════════════════════════════════════════════════════════╝")
console.log(`Server: ${SERVER_URL}`)
console.log(`Project: ${PROJECT_DIR}\n`)

async function main() {
  // Step 1: Create client
  console.log("► Step 1: Creating OpenCode client...")
  const client = createOpencodeClient({
    baseUrl: SERVER_URL,
    directory: PROJECT_DIR,
  })

  // Step 2: Health check
  console.log("\n► Step 2: Health check...")
  const health = await client.global.health()
  console.log("  ✓ Server:", health.data)

  // Step 3: Create session
  console.log("\n► Step 3: Creating session...")
  const session = await client.session.create({
    title: 'yyyy'
  })
  if (!session?.data?.id) {
    console.log("  ⚠ Session creation failed:", session?.error)
    console.log("\n  Note: Session creation requires proper server configuration.")
    console.log("  Continuing with event subscription test...\n")
  } else {
    console.log("  ✓ Session:", session.data.id.slice(0, 30) + "...")
  }
  const sessionId = session?.data?.id

  // Step 4: Subscribe to events (MUST await!)
  console.log("\n► Step 4: Subscribing to events via client.event.subscribe()...")
  const receivedEvents: string[] = []
  let messageEventCount = 0
  
  const subscription = await client.event.subscribe()
  console.log("  ✓ Subscribed to /event endpoint")

  // Step 5: Send message (if session exists)
  if (sessionId) {
    console.log("\n► Step 5: Sending test message...")
    try {
      await client.session.prompt({
        sessionID: sessionId,
        parts: [{ type: "text", text: "Hello! Reply with: 'SDK test received.'" }],
      })
      console.log("  ✓ Message sent successfully")
    } catch (e: any) {
      console.log("  ⚠ Message error:", e?.message?.slice(0, 50) || e)
    }

    // Step 6: Wait for message events
    console.log("\n► Step 6: Waiting for message events (5s)...")
    await new Promise(r => setTimeout(r, 5000))
  }

  // Step 7: Consume stream
  console.log("\n► Step 7: Consuming event stream (3 events or 3s)...")
  let streamCount = 0
  const consumePromise = (async () => {
    for await (const event of subscription.stream) {
      streamCount++
      const data = event as any
      console.log(`  📡 Stream: ${data?.payload?.type || data?.type}`, `\n${JSON.stringify(data)}`);
      //if (streamCount >= 3) break
    }
  })()
  
  await Promise.race([
    consumePromise,
    new Promise(r => setTimeout(r, 3000))
  ])

  // Step 8: Cleanup
  if (sessionId) {
    console.log("\n► Step 8: Cleanup...")
    try {
      await client.session.delete({ sessionID: sessionId })
      console.log("  ✓ Session deleted")
    } catch (e) {
      console.log("  ⚠ Delete failed")
    }
  }

  // Summary
  console.log("\n╔═══════════════════════════════════════════════════════════╗")
  console.log("║                    Summary                                ║")
  console.log("╚═══════════════════════════════════════════════════════════╝")
  console.log(`  Events received: ${receivedEvents.length}`)
  console.log(`  Message events:  ${messageEventCount}`)
  console.log(`  Stream events:   ${streamCount}`)
  
  if (receivedEvents.length > 0) {
    console.log(`  Event types: ${[...new Set(receivedEvents)].join(", ")}`)
  }
  
  if (messageEventCount > 0) {
    console.log("\n✅ PASSED: Received message events via client.event.subscribe()")
  } else if (receivedEvents.length > 0) {
    console.log("\n✅ PASSED: Event subscription working")
    console.log("   (No message events - may need provider config)")
  } else {
    console.log("\n⚠️  No events received")
  }
  
  process.exit(0)
}

process.on("SIGINT", () => {
  console.log("\n\n► Interrupted")
  process.exit(0)
})

main().catch(e => {
  console.error("\n✗ Error:", e)
  process.exit(1)
})
