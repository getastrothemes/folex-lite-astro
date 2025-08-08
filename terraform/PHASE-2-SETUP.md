# Phase 2 Setup: Enable Custom Domain

After ACM certificate validation is complete, follow these steps to enable the custom domain.

## Prerequisites

1. ACM validation DNS records have been added to NIC.DO
2. Certificate status is "Issued" in AWS Console (Certificate Manager)

## Step 1: Check Certificate Status

```bash
# Check if certificate is validated
aws acm describe-certificate --certificate-arn $(terraform output -raw acm_certificate_arn) --region us-east-1 --profile personal --query 'Certificate.Status'
```

Should return: `"ISSUED"`

## Step 2: Enable Custom Domain in CloudFront

Edit the following files to enable custom domain and certificate:

### Update `cloudfront.tf`:

1. **Uncomment the aliases line**:
```hcl
aliases = [var.www_domain_name]
```

2. **Update viewer_certificate section**:
```hcl
viewer_certificate {
  acm_certificate_arn      = aws_acm_certificate.website.arn
  ssl_support_method       = "sni-only"
  minimum_protocol_version = "TLSv1.2_2021"
}
```

3. **Remove/comment cloudfront_default_certificate**:
```hcl
# cloudfront_default_certificate = true  # Comment this out
```

### Update `acm.tf`:

Uncomment the certificate validation resource:
```hcl
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
```

## Step 3: Apply Changes

```bash
terraform plan
terraform apply
```

## Step 4: Add WWW CNAME to NIC.DO

After CloudFront update completes, add the WWW CNAME record:

1. Get the CloudFront domain:
```bash
terraform output cloudfront_domain_name
```

2. In NIC.DO, add:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: [CloudFront domain from step 1]

## Step 5: Test Custom Domain

```bash
# Test HTTPS
curl -I https://www.barracuda.do

# Should return 200 OK with CloudFront headers
```

## Step 6: Update Pipeline

The GitHub Actions pipeline will automatically use the custom domain once these changes are applied.

## Troubleshooting

### CloudFront update fails:
- Ensure certificate status is "ISSUED"
- Wait 5-10 minutes after certificate validation
- Check AWS Console for detailed error messages

### Custom domain not working:
- Verify CNAME record in NIC.DO points to correct CloudFront domain
- Wait for DNS propagation (up to 30 minutes)
- Check CloudFront distribution status is "Deployed"

## Rollback Plan

If issues occur, you can quickly rollback:

1. Comment out the aliases line in cloudfront.tf
2. Switch back to `cloudfront_default_certificate = true`
3. Run `terraform apply`
4. Remove WWW CNAME from NIC.DO if needed