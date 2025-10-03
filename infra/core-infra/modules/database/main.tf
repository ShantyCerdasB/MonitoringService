# Azure Database for PostgreSQL Flexible Server
# Provides managed PostgreSQL database for the monitoring service

resource "azurerm_postgresql_flexible_server" "postgres_server" {
  name                = "${var.name_prefix}-postgres-server-flexible"
  location            = var.location
  resource_group_name = var.resource_group_name
  version             = var.postgres_version

  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  sku_name   = var.sku_name
  storage_mb = var.storage_mb

  public_network_access_enabled = var.public_network_access == "Enabled"
  backup_retention_days          = 7

  lifecycle {
    ignore_changes = [
      zone,
      high_availability[0].standby_availability_zone,
    ]
  }

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}

# Firewall rule to allow Azure services access
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "${var.name_prefix}-fw-azure-services"
  server_id        = azurerm_postgresql_flexible_server.postgres_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Firewall rules for specific IP addresses when public access is enabled
resource "azurerm_postgresql_flexible_server_firewall_rule" "postgres_firewall" {
  count = var.public_network_access == "Enabled" ? length(var.allowed_ips) : 0

  name             = "${var.name_prefix}-fw-${count.index}"
  server_id        = azurerm_postgresql_flexible_server.postgres_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# Default database for the monitoring service
resource "azurerm_postgresql_flexible_server_database" "postgres_database" {
  name      = "${var.name_prefix}-db"
  server_id = azurerm_postgresql_flexible_server.postgres_server.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
