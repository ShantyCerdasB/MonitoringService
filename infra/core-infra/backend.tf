terraform {
  backend "azurerm" {
    resource_group_name   = "tfstate-rg-in-contact-app"
    storage_account_name  = "tfstateaccountn12g4v"
    container_name        = "tfstate"
    key                   = "core-infra-prod.tfstate"
  }
}
