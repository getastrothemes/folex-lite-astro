terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  profile = "personal"
  region  = var.aws_region
}

# ACM Certificate must be in us-east-1 for CloudFront
provider "aws" {
  alias   = "us_east_1"
  profile = "personal"
  region  = "us-east-1"
}

# Local values for consistent naming
locals {
  project = "barracuda-do"
  domain  = "barracuda.do"
  www_domain = "www.barracuda.do"
  
  tags = {
    Project     = local.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}