# Azure Service Bus for reliable message queuing
# Provides asynchronous communication between application components

resource "azurerm_servicebus_namespace" "serviceBus" {
  name                = "${var.name_prefix}-service-bus"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku_name
}

# Topic for command messages
resource "azurerm_servicebus_topic" "commands" {
  name         = var.topic_name
  namespace_id = azurerm_servicebus_namespace.serviceBus.id
}

# Authorization rule for Service Bus access
resource "azurerm_servicebus_namespace_authorization_rule" "rule" {
  name         = var.auth_rule_name
  namespace_id = azurerm_servicebus_namespace.serviceBus.id
  listen       = true
  send         = true
  manage       = true
}

# Subscription for processing command messages
resource "azurerm_servicebus_subscription" "commands_sub" {
  name               = "commands-sub"
  topic_id           = azurerm_servicebus_topic.commands.id
  max_delivery_count = 1
  lock_duration      = "PT5M"
}