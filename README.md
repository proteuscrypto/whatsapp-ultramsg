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

## Configuracion (una vez por usuario)

Cada persona que instale este plugin conecta **su propio numero de
WhatsApp** con su propia instancia de UltraMsg (recomendado por seguridad:
las credenciales no se comparten entre usuarios).

1. Crear una cuenta gratuita en [ultramsg.com](https://ultramsg.com) y crear
   una "Instance" nueva (el plan gratuito/trial alcanza para probar; para uso
   real conviene un plan pago segun volumen de mensajes).
2. En el panel de la instancia, copiar el **Instance ID** y el **Token**.
3. Vincular el numero de WhatsApp real a la instancia: en el panel de
   UltraMsg pedir el codigo QR (o usar la herramienta `get_qr_code` una vez
   instalado el plugin) y escanearlo desde WhatsApp en el telefono
   (Configuracion → Dispositivos vinculados → Vincular un dispositivo), igual
   que al vincular [WhatsApp Web](https://web.whatsapp.com/).
4. Al instalar este plugin, configurar las variables de entorno:
   - `ULTRAMSG_INSTANCE_ID` — el Instance ID del paso 2.
   - `ULTRAMSG_TOKEN` — el Token del paso 2.
5. Verificar la conexion pidiendole a Claude "revisa el estado de mi
   instancia de WhatsApp" (usa la herramienta `get_instance_status`).

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

- El token de UltraMsg da acceso completo a esa instancia (leer y enviar
  mensajes en nombre del numero vinculado). Tratarlo como una contrasena:
  no compartirlo ni pegarlo en chats o repos publicos.
- El plugin nunca envia mensajes masivos sin confirmacion explicita del
  usuario (ver `skills/whatsapp-ultramsg/SKILL.md`).

## Creditos

Plugin desarrollado y mantenido por [NetDigitalTech](https://netdigitaltech.com/).
