variable "name_prefix" {
  description = "Prefix for public IP resource naming"
  type        = string
}

variable "purpose" {
  description = "Purpose identifier for the public IP (e.g., livekit, stunner)"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name for public IP deployment"
  type        = string
}

variable "region" {
  description = "Azure region for public IP deployment"
  type        = string
}

