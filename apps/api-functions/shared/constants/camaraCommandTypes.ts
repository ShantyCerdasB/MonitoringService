/**
 * @file camaraCommandTypes.ts
 * @summary Type constants for camara command operations
 * @description Local enums and types for camara command functionality.
 */

/**
 * Delivery methods for camera commands.
 */
export enum DeliveryMethod {
  WEBSOCKET = "websocket",
  SERVICE_BUS = "service_bus"
}

/**
 * Command delivery status.
 */
export enum CommandStatus {
  SENT = "sent",
  FAILED = "failed",
  PENDING = "pending"
}
