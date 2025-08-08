# ACM Certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1
  
  domain_name               = var.www_domain_name
  subject_alternative_names = [var.domain_name] # Include apex for future use
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.tags
}

resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1
  
  certificate_arn = aws_acm_certificate.website.arn
  
  timeouts {
    create = "10m"
  }
  
  lifecycle {
    create_before_destroy = true
  }
}