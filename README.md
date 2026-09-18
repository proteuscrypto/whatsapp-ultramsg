# WhatsApp + UltraMsg

Connect [WhatsApp](https://web.whatsapp.com/) to Claude using the
[UltraMsg](https://ultramsg.com) API to send and read messages and manage
groups and contacts from a Claude conversation.

**Developed by [NetDigitalTech](https://netdigitaltech.com/).**

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

## Componentes

| Component | Count | Purpose |
|---|---|---|
| MCP server | 1 | Exposes 22 tools that call the UltraMsg REST API (`api.ultramsg.com`) |
| Skill | 1 | Guides Claude on phone numbers, chat IDs, confirmations, and responses |

## Setup (once per user)

Each person who installs this plugin connects their own WhatsApp number to
their own UltraMsg instance. Credentials are never shared between users.

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
$env:ULTRAMSG_TOKEN = "tu_token"
```

Then restart Claude from the same session.

## Usage

After setup, ask Claude in natural language. For example:

- "Send a WhatsApp message to +54 9 11 2233-4455 saying I will be late."
- "Check my latest WhatsApp messages."
- "List my WhatsApp groups."
- "Check whether this number has WhatsApp: +1 405 555 0100."
- "Send this image to Juan on WhatsApp." (The image needs a public URL.)

## Seguridad

- The UltraMsg token gives full access to the instance. Treat it like a
  password: never share it or paste it into chats or public repositories.
- If a token appears in a screenshot, chat, log, or repository, regenerate it
  immediately in the UltraMsg dashboard and update `.env`.
- The plugin never sends bulk messages without explicit user confirmation
  (see `skills/whatsapp-ultramsg/SKILL.md`).

## Credits

Plugin developed and maintained by [NetDigitalTech](https://netdigitaltech.com/).
