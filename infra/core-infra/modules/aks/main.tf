# Azure Kubernetes Service cluster for container orchestration
# Provides a managed Kubernetes environment for LiveKit and related services

resource "azurerm_kubernetes_cluster" "aks-cluster" {
  name                = "${var.name_prefix}-k8s"
  location            = var.region
  resource_group_name = var.resource_group
  dns_prefix          = var.name_prefix
  sku_tier            = var.aks_price_tier

  # System node pool for Kubernetes system components
  default_node_pool {
    name           = "systempool"
    vm_size        = var.vm_sku
    node_count     = 1
    vnet_subnet_id = var.vnet_subnet_id

    upgrade_settings {
      drain_timeout_in_minutes      = 0
      max_surge                     = "10%"
      node_soak_duration_in_minutes = 0
    }
  }

  lifecycle {
    ignore_changes = [
      image_cleaner_enabled,
      image_cleaner_interval_hours,
    ]
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
  }
}

# User node pool with autoscaling for application workloads
resource "azurerm_kubernetes_cluster_node_pool" "livekit-pool" {
  name                  = "livekit"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks-cluster.id
  vm_size               = var.vm_sku
  vnet_subnet_id        = var.vnet_subnet_id
  mode                  = "User"

  node_labels = {
    workload = "livekit"
  }
}
