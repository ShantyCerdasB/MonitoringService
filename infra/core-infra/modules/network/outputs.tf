output "vnet_id" {
  value       = azurerm_virtual_network.main-vnet.id
  description = "Resource ID of the created virtual network"
}

output "subnet_id" {
  value       = azurerm_subnet.main-subnet.id
  description = "Resource ID of the created subnet"
}
