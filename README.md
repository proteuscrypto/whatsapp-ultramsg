# WhatsApp + UltraMsg

Conecta [WhatsApp](https://web.whatsapp.com/) a Claude usando la API de
[UltraMsg](https://ultramsg.com), para enviar y leer mensajes, manejar
grupos y contactos, todo desde una conversacion con Claude.

**Desarrollado por [NetDigitalTech](https://netdigitaltech.com/).**

## Que hace

- Enviar mensajes de texto, imagenes, documentos, audio, video, ubicacion y
  contactos (vCard) por WhatsApp.
- Leer el historial de mensajes y chats de la instancia conectada.
- Reaccionar y borrar mensajes.
- Listar y consultar grupos y contactos, verificar si un numero tiene
  WhatsApp, bloquear/desbloquear contactos.
- Ver el estado de conexion de la instancia y obtener el codigo QR para
  vincular WhatsApp.

> **Nota sobre "editar" mensajes**: WhatsApp no permite editar el texto de un
> mensaje ya enviado a traves de la API. La alternativa que ofrece el plugin
> es borrar el mensaje (`delete_message`) y enviar uno nuevo corregido.

## Componentes

| Componente | Cantidad | Proposito |
|---|---|---|
| MCP Server | 1 | Expone 22 herramientas que llaman a la API REST de UltraMsg (`api.ultramsg.com`) |
| Skill | 1 | Guia a Claude sobre formato de numeros/chatIds, confirmaciones antes de enviar, y como interpretar respuestas |

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

## Uso

Una vez configurado, simplemente pedile a Claude en lenguaje natural, por
ejemplo:

- "Mandale un WhatsApp a +54 9 11 2233-4455 diciendo que llego tarde"
- "Revisa los ultimos mensajes de WhatsApp"
- "Que grupos de WhatsApp tengo"
- "Chequea si este numero tiene WhatsApp: +1 405 555 0100"
- "Enviale esta imagen por WhatsApp a Juan" (necesita una URL publica de la
  imagen)

## Seguridad

- The UltraMsg token gives full access to the instance. Treat it like a
  password: never share it or paste it into chats or public repositories.
- If a token appears in a screenshot, chat, log, or repository, regenerate it
  immediately in the UltraMsg dashboard and update `.env`.
- The plugin never sends bulk messages without explicit user confirmation
  (see `skills/whatsapp-ultramsg/SKILL.md`).

## Creditos

Plugin desarrollado y mantenido por [NetDigitalTech](https://netdigitaltech.com/).
