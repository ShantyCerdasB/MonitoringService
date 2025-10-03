variable "name_prefix" {
  description = "Prefix used for naming AKS resources"
  type        = string
  default     = "livekit-agent-azure"
}

variable "resource_group" {
  description = "Resource group name for AKS cluster deployment"
  type        = string
}

variable "region" {
  description = "Azure region for AKS cluster deployment"
  type        = string
  default     = "eastus"
}

variable "vm_sku" {
  description = "Virtual machine SKU for AKS node pools"
  type        = string
  default     = "Standard_B4ms"
}

variable "aks_node_count" {
  description = "Number of nodes in the default AKS node pool"
  type        = number
  default     = 2
}

variable "aks_price_tier" {
  description = "AKS cluster pricing tier (Standard or Free)"
  type        = string
  default     = "Standard"
}

variable "vnet_subnet_id" {
  description = "Resource ID of the subnet for AKS node placement"
  type        = string
}
