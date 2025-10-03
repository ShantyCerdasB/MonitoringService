variable "name_prefix" {
  description = "Prefix used for naming network resources"
  type        = string
  default     = "livekit-agent-azure"
}

variable "region" {
  description = "Azure region for network deployment"
  type        = string
  default     = "eastus"
}

variable "resource_group" {
  description = "Resource group name for network resources"
  type        = string
}

variable "vnet_ip" {
  description = "Base IP address for the virtual network"
  type        = string
  default     = "10.26.0.0"
}

variable "vnet_mask" {
  description = "CIDR mask for the virtual network address space"
  type        = string
  default     = "/16"
}

variable "subnet_mask" {
  description = "CIDR mask for the AKS subnet"
  type        = string
  default     = "/20"
}
