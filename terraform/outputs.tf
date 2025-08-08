output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.website.arn
}

output "acm_validation_records" {
  description = "DNS validation records for ACM certificate (to be added to NIC.DO)"
  value = {
    for record in aws_acm_certificate.website.domain_validation_options : record.domain_name => {
      name  = record.resource_record_name
      type  = record.resource_record_type
      value = record.resource_record_value
    }
  }
}

output "dns_configuration" {
  description = "DNS records to configure in NIC.DO"
  value = {
    acm_validation = {
      for record in aws_acm_certificate.website.domain_validation_options : record.domain_name => {
        name        = record.resource_record_name
        type        = record.resource_record_type
        value       = record.resource_record_value
        description = "ACM certificate validation for ${record.domain_name}"
      }
    }
    www_cname = {
      name        = "www"
      type        = "CNAME"
      value       = aws_cloudfront_distribution.website.domain_name
      description = "Point www.barracuda.do to CloudFront distribution"
    }
  }
}

# Formatted output for easy copying to NIC.DO
output "nic_do_dns_instructions" {
  description = "Instructions for NIC.DO DNS configuration"
  value = <<-EOT
    
    ===== DNS RECORDS TO ADD IN NIC.DO =====
    
    1. ACM Certificate Validation Records:
    %{for record in aws_acm_certificate.website.domain_validation_options~}
       Domain: ${record.domain_name}
       Name: ${record.resource_record_name}
       Type: ${record.resource_record_type}
       Value: ${record.resource_record_value}
    %{endfor~}
    
    2. WWW CNAME Record (WAIT - Don't add this yet):
       Name: www
       Type: CNAME
       Value: ${aws_cloudfront_distribution.website.domain_name}
    
    3. Apex Domain (barracuda.do) - Phase 1:
       Set up URL forwarding from barracuda.do to https://www.barracuda.do
    
    ==========================================
    
    CURRENT STATUS: CloudFront is deployed with default certificate
    Temporary URL for testing: https://${aws_cloudfront_distribution.website.domain_name}
    
    NEXT STEPS:
    1. Add ONLY the ACM validation records above to NIC.DO
    2. Wait for certificate validation (check AWS Console)
    3. Run the commands in PHASE-2-SETUP.md to enable custom domain
    4. Then add the WWW CNAME record
  EOT
}