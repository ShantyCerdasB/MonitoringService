terraform {
  backend "azurerm" {
    resource_group_name   = "tfstate-rg-in-contact-app2"
    storage_account_name  = "tfstateaccount92kgjn"
    container_name        = "tfstate"
    key                   = "core-infra-prod.tfstate"
  }
}
