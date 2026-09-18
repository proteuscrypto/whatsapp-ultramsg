# Wapliss WhatsApp for Claude

Connect [WhatsApp](https://web.whatsapp.com/) to Claude through
[Wapliss](https://wapliss.com/ultramsg). Wapliss manages authentication,
UltraMsg connectivity, subscription plans, and message quotas.

**Provided by [Wapliss](https://wapliss.com/).**

## User setup

The intended user experience is zero-configuration inside Claude:

1. Install the Wapliss WhatsApp plugin in Claude.
2. Ask Claude to send a WhatsApp message or check the connection.
3. When Claude reports that the account is not connected, open
  [wapliss.com/ultramsg](https://wapliss.com/ultramsg).
4. Sign in with Google or email.
5. Connect WhatsApp by scanning the QR code shown by Wapliss.
6. Return to Claude and retry the action.

Users must never copy an UltraMsg token into Claude. Wapliss stores and uses
the provider credentials on the server side.

> **Deployment requirement:** the zero-configuration flow requires the Wapliss
> hosted MCP server, OAuth callback, database, and UltraMsg provisioning API.
> The local `stdio` server in this repository is a development fallback and
> does not yet provide user authentication, quotas, or Stripe billing.

## Features

- Send text, image, document, audio, video, location, and contact (vCard)
  messages through WhatsApp.
- Read message history and chats from the connected instance.
- React to and delete messages.
- List and inspect groups and contacts, check WhatsApp availability, and
  block or unblock contacts.
- Check the connection status and get the QR code needed to link WhatsApp.

> **Editing messages:** WhatsApp does not support editing an already-sent
> message through the API. The plugin can delete it (`delete_message`) and
> send a corrected replacement.

## Components

| Component | Count | Purpose |
|---|---|---|
| MCP server | 1 | Exposes 22 tools that call the UltraMsg REST API (`api.ultramsg.com`) |
| Skill | 1 | Guides Claude on phone numbers, chat IDs, confirmations, and responses |

## Local development fallback

For local development only, the current `stdio` server can call a manually
configured UltraMsg instance. This path is not the intended end-user flow.

1. Create a free account at [ultramsg.com](https://ultramsg.com) and create a
  new **Instance**. The free trial is enough for testing.
2. Open the instance dashboard and copy the **Instance ID** and **Token**.
3. In UltraMsg, display the QR code. On your phone, open WhatsApp and choose
  **Settings -> Linked devices -> Link a device**, then scan the QR code.
4. Open the installed plugin folder and copy `.env.example` to `.env`.
5. Edit `.env` and replace both placeholder values:

  ```env
  ULTRAMSG_INSTANCE_ID=your_instance_id
  ULTRAMSG_TOKEN=your_token
  ```

  Save the file. The server loads it automatically when Claude starts. Never
  commit or share `.env`; it is excluded by `.gitignore`.
6. Restart Claude so the MCP server reloads the credentials.
7. Test the connection by asking Claude: **"Check my WhatsApp instance
  status."** Claude will use `get_instance_status`.

If the instance is not connected, ask Claude for the QR code and scan it with
WhatsApp using **Settings -> Linked devices -> Link a device**.

### Alternative: environment variables

If you prefer not to use a local file, set `ULTRAMSG_INSTANCE_ID` and
`ULTRAMSG_TOKEN` in the environment that starts Claude. Environment variables
take priority over `.env`.

For example, in PowerShell:

```powershell
$env:ULTRAMSG_INSTANCE_ID = "instance12345"
$env:ULTRAMSG_TOKEN = "your_ultramsg_token"
```

Then restart Claude from the same session.

## Plans and quotas

The Wapliss service will provide:

- **Free:** up to 100 messages per account per UTC day.
- **Pro:** a recurring Stripe subscription with the Wapliss quota removed,
  subject to the limits of the connected UltraMsg plan.
- **Upgrade:** users upgrade from the Wapliss dashboard; the same WhatsApp
  connection remains in place.

The quota must be enforced by the Wapliss middleware, not by Claude and not
by the client-side page. The server must count accepted sends atomically and
reset the daily window at 00:00 UTC.

## Usage

After setup, ask Claude in natural language. For example:

- "Send a WhatsApp message to +54 9 11 2233-4455 saying I will be late."
- "Check my latest WhatsApp messages."
- "List my WhatsApp groups."
- "Check whether this number has WhatsApp: +1 405 555 0100."
- "Send this image to Juan on WhatsApp." (The image needs a public URL.)

## Security

- The UltraMsg token gives full access to the instance. Treat it like a
  password: never share it or paste it into chats or public repositories.
- If a token appears in a screenshot, chat, log, or repository, regenerate it
  immediately in the UltraMsg dashboard and update `.env`.
- The plugin never sends bulk messages without explicit user confirmation
  (see `skills/whatsapp-ultramsg/SKILL.md`).

## Credits

Plugin developed and maintained by [Wapliss](https://wapliss.com/).
