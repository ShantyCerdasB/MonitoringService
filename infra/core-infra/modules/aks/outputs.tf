output "kubeconfig" {
  description = "Kubernetes configuration file for cluster access"
  value       = azurerm_kubernetes_cluster.aks-cluster.kube_config_raw
  sensitive   = true
}
