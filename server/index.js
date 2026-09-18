#!/usr/bin/env node
/**
 * whatsapp-ultramsg MCP server
 *
 * A dependency-free Model Context Protocol server (stdio transport) that
 * exposes the UltraMsg WhatsApp REST API (https://docs.ultramsg.com/) as
 * MCP tools. No npm dependencies are required: only Node.js built-ins
 * (global fetch, process.stdin/stdout) are used, so the plugin runs with
 * just `node index.js` and nothing to install.
 *
 * Auth: reads ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN from the environment
 * (configured per-user when the plugin is installed).
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const TOKEN = process.env.ULTRAMSG_TOKEN;
const BASE_URL = `https://api.ultramsg.com/${INSTANCE_ID}`;

function requireCreds() {
  if (!INSTANCE_ID || !TOKEN) {
    throw new Error(
      "ULTRAMSG_INSTANCE_ID and/or ULTRAMSG_TOKEN is missing. " +
        "Copy .env.example to .env in the plugin folder, enter your UltraMsg " +
        "credentials, and restart Claude (see README)."
    );
  }
}

/**
 * Call the UltraMsg REST API.
 * @param {string} path - e.g. "/messages/chat"
 * @param {"GET"|"POST"} method
 * @param {Record<string, any>} params - body (POST) or query (GET) params
 */
async function ultramsg(path, method, params = {}) {
  requireCreds();
  const url = new URL(`${BASE_URL}${path}`);
  const body = { token: TOKEN, ...params };

  let res;
  if (method === "GET") {
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    res = await fetch(url.toString(), { method: "GET" });
  } else {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null) form.set(k, String(v));
    }
    res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`UltraMsg API error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// ---- Tool definitions -------------------------------------------------

const tools = [
  {
    name: "send_text_message",
    description:
      "Send a WhatsApp text message to a number (international format, e.g. +5491122334455) or a group chatId.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "International phone number or chatId (ending in @c.us or @g.us)" },
        body: { type: "string", description: "Message text (maximum 4096 characters)" },
        priority: { type: "integer", description: "Optional sending priority (higher values are sent first)" },
      },
      required: ["to", "body"],
    },
    handler: (a) => ultramsg("/messages/chat", "POST", { to: a.to, body: a.body, priority: a.priority }),
  },
  {
    name: "send_image",
    description: "Send an image through WhatsApp from a URL, with an optional caption.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        image: { type: "string", description: "Public image URL or base64 data" },
        caption: { type: "string" },
      },
      required: ["to", "image"],
    },
    handler: (a) => ultramsg("/messages/image", "POST", { to: a.to, image: a.image, caption: a.caption }),
  },
  {
    name: "send_document",
    description: "Send a document or file through WhatsApp from a URL.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        document: { type: "string", description: "Public document URL or base64 data" },
        filename: { type: "string" },
        caption: { type: "string" },
      },
      required: ["to", "document", "filename"],
    },
    handler: (a) =>
      ultramsg("/messages/document", "POST", {
        to: a.to,
        document: a.document,
        filename: a.filename,
        caption: a.caption,
      }),
  },
  {
    name: "send_audio",
    description: "Send an audio or voice note through WhatsApp from a URL.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        audio: { type: "string", description: "Public audio URL or base64 data" },
      },
      required: ["to", "audio"],
    },
    handler: (a) => ultramsg("/messages/audio", "POST", { to: a.to, audio: a.audio }),
  },
  {
    name: "send_video",
    description: "Send a video through WhatsApp from a URL, with an optional caption.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        video: { type: "string", description: "Public video URL or base64 data" },
        caption: { type: "string" },
      },
      required: ["to", "video"],
    },
    handler: (a) => ultramsg("/messages/video", "POST", { to: a.to, video: a.video, caption: a.caption }),
  },
  {
    name: "send_location",
    description: "Send a location (latitude/longitude) through WhatsApp.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        lat: { type: "string" },
        lng: { type: "string" },
        address: { type: "string" },
      },
      required: ["to", "lat", "lng"],
    },
    handler: (a) => ultramsg("/messages/location", "POST", { to: a.to, lat: a.lat, lng: a.lng, address: a.address }),
  },
  {
    name: "send_vcard",
    description: "Send a contact (vCard) through WhatsApp.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        vcard: { type: "string", description: "Complete vCard content" },
      },
      required: ["to", "vcard"],
    },
    handler: (a) => ultramsg("/messages/vcard", "POST", { to: a.to, vcard: a.vcard }),
  },
  {
    name: "send_reaction",
    description: "React with an emoji to a sent or received message.",
    inputSchema: {
      type: "object",
      properties: {
        msg_id: { type: "string", description: "ID of the message to react to" },
        emoji: { type: "string", description: "Reaction emoji, e.g. \"👍\"" },
      },
      required: ["msg_id", "emoji"],
    },
    handler: (a) => ultramsg("/messages/reaction", "POST", { msgId: a.msg_id, emoji: a.emoji }),
  },
  {
    name: "delete_message",
    description:
      "Delete a sent message (WhatsApp does not support editing sent text through the API; delete it and resend it with send_text_message).",
    inputSchema: {
      type: "object",
      properties: { msg_id: { type: "string" } },
      required: ["msg_id"],
    },
    handler: (a) => ultramsg("/messages/delete", "POST", { msgId: a.msg_id }),
  },
  {
    name: "get_messages",
    description: "Get the instance message history (sent, queued, unsent, invalid, or all).",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["sent", "queue", "unsent", "invalid", "all"], default: "all" },
        page: { type: "integer", default: 1 },
        limit: { type: "integer", default: 50, description: "Maximum 100" },
        sort: { type: "string", enum: ["asc", "desc"], default: "desc" },
      },
    },
    handler: (a) =>
      ultramsg("/messages", "GET", {
        status: a.status || "all",
        page: a.page || 1,
        limit: a.limit || 50,
        sort: a.sort || "desc",
      }),
  },
  {
    name: "get_chats",
    description: "List the WhatsApp instance chats (conversations).",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/chats", "GET"),
  },
  {
    name: "get_chat_messages",
    description: "Get messages from a specific chat by chatId.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: { type: "string" },
        limit: { type: "integer", default: 50 },
      },
      required: ["chatId"],
    },
    handler: (a) => ultramsg("/chats/messages", "GET", { chatId: a.chatId, limit: a.limit || 50 }),
  },
  {
    name: "mark_chat_read",
    description: "Mark a chat as read.",
    inputSchema: {
      type: "object",
      properties: { chatId: { type: "string" } },
      required: ["chatId"],
    },
    handler: (a) => ultramsg("/chats/read", "POST", { chatId: a.chatId }),
  },
  {
    name: "archive_chat",
    description: "Archive or unarchive a chat.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: { type: "string" },
        archive: { type: "boolean", default: true, description: "true to archive, false to unarchive" },
      },
      required: ["chatId"],
    },
    handler: (a) =>
      ultramsg(a.archive === false ? "/chats/unarchive" : "/chats/archive", "POST", { chatId: a.chatId }),
  },
  {
    name: "get_groups",
    description: "List the WhatsApp groups in the instance.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/groups", "GET"),
  },
  {
    name: "get_group",
    description: "Get details for a specific group (members, admins, and more).",
    inputSchema: {
      type: "object",
      properties: { groupId: { type: "string" } },
      required: ["groupId"],
    },
    handler: (a) => ultramsg("/groups/group", "GET", { groupId: a.groupId }),
  },
  {
    name: "get_contacts",
    description: "List the contacts saved in the WhatsApp instance.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/contacts", "GET"),
  },
  {
    name: "check_contact",
    description: "Check whether a number exists and has an active WhatsApp account.",
    inputSchema: {
      type: "object",
      properties: { chatId: { type: "string", description: "Number or chatId to check" } },
      required: ["chatId"],
    },
    handler: (a) => ultramsg("/contacts/check", "GET", { chatId: a.chatId }),
  },
  {
    name: "block_contact",
    description: "Block or unblock a contact.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: { type: "string" },
        block: { type: "boolean", default: true },
      },
      required: ["chatId"],
    },
    handler: (a) =>
      ultramsg(a.block === false ? "/contacts/unblock" : "/contacts/block", "POST", { chatId: a.chatId }),
  },
  {
    name: "get_instance_status",
    description: "Check the WhatsApp instance connection status (connected, disconnected, waiting for QR, and more).",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/instance/status", "GET"),
  },
  {
    name: "get_qr_code",
    description: "Get the QR code to link WhatsApp to the instance when it is not authenticated.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/instance/qr", "GET"),
  },
  {
    name: "restart_instance",
    description: "Restart the WhatsApp instance if it is stuck or disconnected.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ultramsg("/instance/restart", "POST"),
  },
];

const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));

// ---- Minimal MCP (JSON-RPC 2.0 over stdio, newline-delimited) --------

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "whatsapp-ultramsg", version: "0.3.2" };

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

function sendResult(id, result) {
  if (id === undefined) return; // notifications get no response
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  if (id === undefined) return;
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleRequest(msg) {
  const { id, method, params } = msg;
  try {
    switch (method) {
      case "initialize":
        sendResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
        return;

      case "notifications/initialized":
      case "notifications/cancelled":
        return; // no response for notifications

      case "ping":
        sendResult(id, {});
        return;

      case "tools/list":
        sendResult(id, {
          tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
        });
        return;

      case "tools/call": {
        const toolName = params && params.name;
        const tool = toolsByName[toolName];
        if (!tool) {
          sendResult(id, {
            isError: true,
            content: [{ type: "text", text: `Herramienta desconocida: ${toolName}` }],
          });
          return;
        }
        try {
          const result = await tool.handler((params && params.arguments) || {});
          sendResult(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
        } catch (err) {
          sendResult(id, { isError: true, content: [{ type: "text", text: `Error: ${err.message}` }] });
        }
        return;
      }

      default:
        // Unknown/unsupported method (e.g. resources/list, prompts/list):
        // reply with a proper JSON-RPC error instead of hanging the client.
        sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    sendError(id, -32603, `Internal error: ${err.message}`);
  }
}

function main() {
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      const trimmed = line.trim();
      if (!trimmed) continue;
      let msg;
      try {
        msg = JSON.parse(trimmed);
      } catch {
        continue; // ignore malformed lines
      }
      handleRequest(msg);
    }
  });
  process.stdin.on("end", () => process.exit(0));
}

main();
