variable "resource_group_name" {
  description = "Resource group name for Service Bus deployment"
  type        = string
}

variable "location" {
  description = "Azure region for Service Bus deployment"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for Service Bus namespace naming"
  type        = string
}

variable "sku_name" {
  description = "Service Bus namespace SKU tier"
  type        = string
  default     = "Standard"
}

variable "topic_name" {
  description = "Name of the Service Bus topic for command messages"
  type        = string
  default     = "commands"
}

variable "auth_rule_name" {
  description = "Name of the Service Bus authorization rule"
  type        = string
  default     = "sb-policy"
}

variable "spa_sp_object_id" {
  description = "Object ID of the Single Page Application service principal"
  type        = string
}

variable "api_sp_object_id" {
  description = "Object ID of the API application service principal"
  type        = string
}

variable "api_scope_value" {
  description = "UUID of the API OAuth2 permission scope"
  type        = string
}