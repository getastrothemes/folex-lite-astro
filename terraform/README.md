# Terraform Infrastructure for barracuda.do

This directory contains Terraform configuration to deploy the barracuda.do static site using AWS CloudFront, S3, and ACM.

## Architecture

- **S3 Bucket**: Private bucket (`barracuida-ai-landing`) for website content
- **CloudFront**: CDN distribution with custom domain `www.barracuda.do`
- **ACM Certificate**: SSL certificate for HTTPS (in us-east-1)
- **Origin Access Control (OAC)**: Restricts S3 bucket access to CloudFront only

## Prerequisites

1. AWS CLI configured with the `personal` profile
2. Terraform >= 1.0 installed
3. Existing S3 bucket `barracuida-ai-landing`

## Initial Setup

### 1. Import Existing Resources

Run the import script to import the existing S3 bucket:

```bash
cd terraform
./import.sh
```

### 2. First Deployment

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

This will create:
- ACM certificate (pending DNS validation)
- CloudFront distribution
- S3 bucket policies and configurations

### 3. DNS Configuration

After the first apply, check the outputs for DNS records:

```bash
terraform output nic_do_dns_instructions
```

Add the displayed DNS records to NIC.DO:
1. ACM validation CNAME records
2. WWW CNAME pointing to CloudFront distribution
3. Set up URL forwarding from apex domain to www

### 4. Enable Certificate Validation

Once DNS records are added to NIC.DO:

1. Uncomment the `aws_acm_certificate_validation` resource in `acm.tf`
2. Uncomment the `depends_on` line in `cloudfront.tf`
3. Run `terraform apply` again

## File Structure

- `main.tf` - Provider configuration and locals
- `variables.tf` - Input variables
- `s3.tf` - S3 bucket and related resources
- `acm.tf` - SSL certificate configuration
- `cloudfront.tf` - CloudFront distribution and OAC
- `outputs.tf` - Output values including DNS configuration
- `import.sh` - Script to import existing S3 bucket

## Deployment Pipeline

The GitHub Actions workflow (`../.github/workflows/ci.yaml`) automatically:

1. Builds the Astro site
2. Runs Terraform to update infrastructure
3. Syncs built files to S3
4. Invalidates CloudFront cache
5. Displays DNS configuration

## Phase 2: Route 53 Migration

After NIC.DO nameserver replacement:
1. Create Route 53 hosted zone
2. Add ALIAS record for apex domain pointing to CloudFront
3. Update ACM certificate to validate via Route 53

## Troubleshooting

### Certificate Validation Timeout
- Ensure DNS records are correctly added to NIC.DO
- DNS propagation can take up to 30 minutes
- Check certificate status in AWS Console

### S3 Import Issues
- Verify bucket name `barracuida-ai-landing` exists
- Ensure AWS CLI profile `personal` has proper permissions
- Check if bucket has existing configurations that need importing

### CloudFront Issues
- OAC replaces legacy Origin Access Identity (OAI)
- Ensure S3 bucket policy allows CloudFront access
- Check CloudFront distribution status in AWS Console