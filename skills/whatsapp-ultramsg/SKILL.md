---
name: whatsapp-ultramsg
description: >
  This skill should be used whenever the user asks to send a WhatsApp message,
  check WhatsApp messages, read WhatsApp chats, send an image/document/video/
  audio/location by WhatsApp, manage WhatsApp groups or contacts, or otherwise
  interact with WhatsApp through the UltraMsg API. Trigger phrases include
  "send a WhatsApp message to", "send a WhatsApp message", "check my
  WhatsApp messages", "what does the WhatsApp group say", "send this image
  on WhatsApp", "check whether this number has WhatsApp".
metadata:
  version: "0.1.0"
---

# WhatsApp via UltraMsg

Use the `ultramsg` MCP tools to send and read WhatsApp messages through the
user's UltraMsg instance. UltraMsg is a WhatsApp API gateway: each user (or
the organization) links one real WhatsApp number to an "instance", and the
plugin's tools call that instance's REST API.

## Before sending anything

1. If a tool call fails with a message about missing `ULTRAMSG_INSTANCE_ID` /
  `ULTRAMSG_TOKEN`, tell the user to follow the English setup steps in the
  plugin README: copy `.env.example` to `.env`, enter the credentials from
  https://ultramsg.com, and restart Claude. Stop — do not guess values.
2. If a tool call fails or returns a status indicating the instance is not
   authenticated (e.g. `get_instance_status` reports something other than
   "authenticated"/connected), suggest calling `get_qr_code` and tell the
  user to scan the QR code with WhatsApp on their phone (WhatsApp app ->
   Linked devices → Link a device) to (re)connect the instance.
3. Before sending a message that isn't explicitly and clearly requested by
   the user (e.g. sending to a new recipient not previously discussed, or
   sending to a large group), briefly confirm the recipient and content with
   the user first. Never send bulk/broadcast messages to multiple contacts
   without explicit confirmation of the full recipient list — this can get
   the number banned by WhatsApp and may violate WhatsApp's terms.

## Phone numbers and chat IDs

- Individual chats: international phone format without `+` or spaces also
  works, but prefer passing what the user gave you (e.g. `+5491122334455`);
  UltraMsg accepts either the raw number or a full chat id like
  `5491122334455@c.us`.
- Group chats: use the group's chatId, which ends in `@g.us`. Get it from
  `get_groups` (list) or `get_group` (details) if the user only knows the
  group by name — search the `get_groups` result for a matching subject
  before asking the user to find the id manually.
- Never invent a phone number or chatId. If the user names a contact by
  name only, look them up with `get_contacts` first; if not found, ask for
  the number.

## Sending messages

- Plain text: `send_text_message`.
- Media (`send_image`, `send_document`, `send_audio`, `send_video`): the
  `image`/`document`/`audio`/`video` parameter needs a **publicly
  reachable URL** (UltraMsg fetches it server-side) or a base64 data string.
  If the user only has a local file, you need a way to host it somewhere
  reachable first (e.g. upload it and get a URL) — a local file path alone
  will not work.
- Location: `send_location` needs `lat`/`lng` as decimal strings.
- Contact card: `send_vcard`.

## Editing and deleting

WhatsApp's API does not support editing the text of an already-sent
message. If the user asks to "edit" a message that was already sent, explain
this limitation and offer instead to: delete it with `delete_message` and
send a corrected message with `send_text_message`, or send a follow-up
correction message.

## Reading messages and chats

- `get_messages`: paginated log of messages sent/queued/received on this
  instance (`status` filter: `sent`, `queue`, `unsent`, `invalid`, `all`).
  Use `sort: "desc"` (default) to get the most recent first.
- `get_chats`: list of conversations.
- `get_chat_messages`: messages within one specific chat (needs `chatId`).
- After reading messages for the user, summarize the relevant ones in plain
  language (sender, time, content) rather than dumping raw JSON, unless the
  user asked for the raw data.

## Rate limits and reliability

UltraMsg queues messages when the instance is temporarily disconnected, and
free/trial plans have daily message limits — if a send fails or is queued
for a long time, check `get_instance_status` and mention the possibility of
a plan limit or disconnected session to the user rather than retrying
silently in a loop.
