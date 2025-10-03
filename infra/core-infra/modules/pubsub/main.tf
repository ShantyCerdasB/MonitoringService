# Azure Web PubSub service for real-time communication
# Enables bidirectional communication between clients and server

resource "azurerm_web_pubsub" "web_pubsub" {
  name                = "${var.name}-pubsub"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku
  capacity            = var.unit_count

  identity {
    type = "SystemAssigned"
  }
}

# Default hub for Web PubSub messaging
resource "azurerm_web_pubsub_hub" "default_hub" {
  name          = "livekit_agent_azure_pubsub"
  web_pubsub_id = azurerm_web_pubsub.web_pubsub.id
}
