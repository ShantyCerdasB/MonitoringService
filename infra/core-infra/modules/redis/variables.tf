variable "name_prefix" {
  description = "Prefix for Redis cache resource naming"
  type        = string
}

variable "resource_group" {
  description = "Resource group name for Redis cache deployment"
  type        = string
}

variable "region" {
  description = "Azure region for Redis cache deployment"
  type        = string
}

variable "family" {
  description = "Redis family: 'C' for Basic/Standard, 'P' for Premium"
  type        = string

  validation {
    condition     = contains(["C", "P"], var.family)
    error_message = "family must be 'C' (Basic/Standard) or 'P' (Premium)."
  }
}

variable "capacity" {
  description = "Capacity tier for Redis: integer. For family 'C', valid 0-6; for 'P', valid 1-4."
  type        = number

  validation {
    condition = (
      (var.family == "C" && var.capacity >= 0 && var.capacity <= 6) ||
      (var.family == "P" && var.capacity >= 1 && var.capacity <= 4)
    )
    error_message = "For family 'C', capacity must be between 0 and 6; for 'P', between 1 and 4."
  }
}

variable "sku_name" {
  description = "The SKU tier for Redis: Basic, Standard, or Premium"
  type        = string

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.sku_name)
    error_message = "sku_name must be one of Basic, Standard, or Premium."
  }

  validation {
    condition = (
      (var.family == "C" && contains(["Basic", "Standard"], var.sku_name)) ||
      (var.family == "P" && var.sku_name == "Premium")
    )
    error_message = "If family is 'C', sku_name must be Basic or Standard; if family is 'P', sku_name must be Premium."
  }
}

variable "egress_public_ip" {
  description = "Public IP address for AKS cluster egress traffic"
  type        = string
}
