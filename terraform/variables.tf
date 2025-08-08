variable "aws_region" {
  description = "AWS region for primary resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "The domain name for the site"
  type        = string
  default     = "barracuda.do"
}

variable "www_domain_name" {
  description = "The www subdomain for the site"
  type        = string
  default     = "www.barracuda.do"
}

variable "bucket_name_override" {
  description = "Override for S3 bucket name. If not provided, will use generated name"
  type        = string
  default     = ""
}