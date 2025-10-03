variable "name_prefix" {
  description = "Prefix for Static Web App resource naming"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name for Static Web App deployment"
  type        = string
}

variable "location" {
  description = "Azure region for Static Web App deployment"
  type        = string
}

variable "sku_tier" {
  description = "Static Web App SKU tier (Free or Standard)"
  type        = string
}

variable "tags" {
  description = "Resource tags for the Static Web App"
  type        = map(string)
  default     = {}
}

variable "env_vars" {
  description = "Environment variables (app settings) for the Static Web App"
  type        = map(string)
  default     = {}
}
