variable "resource_group_name" {
  description = "Resource group name for Web PubSub deployment"
  type        = string
}

variable "location" {
  description = "Azure region for Web PubSub service"
  type        = string
}

variable "name" {
  description = "Base name for Web PubSub resource"
  type        = string
}

variable "sku" {
  description = "Web PubSub SKU tier (e.g., Standard_S1, Free_F1)"
  type        = string
  default     = "Standard_S1"
}

variable "unit_count" {
  description = "Number of units for Web PubSub capacity scaling"
  type        = number
  default     = 1
}
