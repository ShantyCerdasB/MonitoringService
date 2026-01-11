resource "azurerm_storage_account" "storage_account" {
  name                     = "incontactstorageprod01"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = var.account_tier
  account_replication_type = var.account_replication_type
  access_tier              = var.access_tier

  identity {
    type = "SystemAssigned"
  }

  tags = {
    CreatedBy = "terraform-simple-storage"
  }
}

resource "azurerm_storage_container" "snapshots" {
  name                  = "snapshots"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "recordings" {
  name                  = "recordings"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private" 
}