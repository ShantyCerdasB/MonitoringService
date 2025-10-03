
# Virtual network for the monitoring service infrastructure
resource "azurerm_virtual_network" "main-vnet" {
  name                = "${var.name_prefix}-vnet"
  location            = var.region
  resource_group_name = var.resource_group
  address_space       = ["${var.vnet_ip}${var.vnet_mask}"]
}

# Primary subnet for AKS cluster nodes and pods
resource "azurerm_subnet" "main-subnet" {
  name                 = "${var.name_prefix}-subnet"
  resource_group_name  = var.resource_group
  virtual_network_name = "${var.name_prefix}-vnet"
  address_prefixes     = ["${var.vnet_ip}${var.subnet_mask}"]
}
