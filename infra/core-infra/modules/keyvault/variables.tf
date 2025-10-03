variable "name_prefix" {
  description = "Prefix for naming resources"
  type        = string
}

variable "resource_group_name" {
  description = "Resource Group name to place the Key Vault"
  type        = string
}

variable "location" {
  description = "Region for Key Vault"
  type        = string
}

variable "key_vault_sku_name" {
  description = "Key Vault SKU name (standard or premium)"
  type        = string
}

variable "webpubsub_connection_string" {
  description = "Azure Web PubSub connection string"
  type        = string
  sensitive   = true
}

variable "livekit_api_key" {
  description = "LiveKit API key for video conferencing service"
  type        = string
  sensitive   = true
}

variable "livekit_api_secret" {
  description = "LiveKit API secret for video conferencing service"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure AD application client secret"
  type        = string
  sensitive   = true
}

variable "service_bus_connection" {
  description = "Azure Service Bus connection string"
  type        = string
  sensitive   = true
}

variable "webpubsub_key" {
  description = "Azure Web PubSub access key"
  type        = string
  sensitive   = true
}

variable "postgres_database_url" {
  description = "PostgreSQL database connection URL"
  type        = string
  sensitive   = true
}
