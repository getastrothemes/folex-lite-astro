#!/bin/bash
set -e

echo "=== Terraform Import Script for Existing S3 Bucket ==="
echo

# Initialize Terraform
echo "1. Initializing Terraform..."
terraform init

# Import existing S3 bucket
echo "2. Importing existing S3 bucket 'barracuida-ai-landing'..."
terraform import aws_s3_bucket.website barracuida-ai-landing

echo "3. Checking if other S3 resources already exist..."

# Check and import S3 bucket public access block if it exists
if aws s3api get-public-access-block --bucket barracuida-ai-landing --profile personal >/dev/null 2>&1; then
    echo "   Importing S3 bucket public access block..."
    terraform import aws_s3_bucket_public_access_block.website barracuida-ai-landing
else
    echo "   S3 bucket public access block doesn't exist, will be created"
fi

# Check and import S3 bucket versioning if it exists
if aws s3api get-bucket-versioning --bucket barracuida-ai-landing --profile personal | grep -q "Status"; then
    echo "   Importing S3 bucket versioning..."
    terraform import aws_s3_bucket_versioning.website barracuida-ai-landing
else
    echo "   S3 bucket versioning not configured, will be created"
fi

# Check and import S3 bucket encryption if it exists
if aws s3api get-bucket-encryption --bucket barracuida-ai-landing --profile personal >/dev/null 2>&1; then
    echo "   Importing S3 bucket encryption..."
    terraform import aws_s3_bucket_server_side_encryption_configuration.website barracuida-ai-landing
else
    echo "   S3 bucket encryption not configured, will be created"
fi

echo
echo "4. Running terraform plan to see what will be created/modified..."
terraform plan

echo
echo "=== Import complete! ==="
echo "Review the plan above, then run 'terraform apply' to proceed"
echo
echo "Next steps:"
echo "1. Run 'terraform apply' to create ACM certificate and CloudFront distribution"
echo "2. Check outputs for DNS records to add to NIC.DO"
echo "3. After adding DNS records, uncomment ACM validation in acm.tf"
echo "4. Run 'terraform apply' again to validate certificate"