# NIC.DO DNS Configuration Guide for barracuda.do

This guide walks you through configuring DNS records in NIC.DO to complete the barracuda.do CloudFront + S3 deployment.

## Prerequisites

1. Access to NIC.DO DNS management for barracuda.do domain
2. Terraform infrastructure must be deployed first (run `terraform apply` in the `/terraform` directory)
3. Have the DNS configuration values ready from Terraform outputs

## Step 1: Get DNS Configuration from Terraform

Run this command in the `terraform/` directory to get the required DNS records:

```bash
cd terraform
terraform output nic_do_dns_instructions
```

This will display something like:

```
===== DNS RECORDS TO ADD IN NIC.DO =====

1. ACM Certificate Validation Records:
   Domain: www.barracuda.do
   Name: _abc123def456789.www.barracuda.do.
   Type: CNAME
   Value: _xyz789abc123def.acm-validations.aws.

   Domain: barracuda.do
   Name: _abc123def456789.barracuda.do.
   Type: CNAME  
   Value: _xyz789abc123def.acm-validations.aws.

2. WWW CNAME Record:
   Name: www
   Type: CNAME
   Value: d1234567890abc.cloudfront.net

3. Apex Domain (barracuda.do) - Phase 1:
   Set up URL forwarding from barracuda.do to https://www.barracuda.do
```

## Step 2: Log into NIC.DO

1. Go to [NIC.DO](https://www.nic.do/)
2. Log into your account
3. Navigate to your domain management for `barracuda.do`
4. Look for "DNS Management" or "DNS Records" section

## Step 3: Add ACM Certificate Validation Records

For **each** validation record shown in the Terraform output:

### For www.barracuda.do validation:
1. Click "Add DNS Record" or similar
2. **Type**: Select `CNAME`
3. **Name**: Enter the name from Terraform output (e.g., `_abc123def456789.www`)
   - ⚠️ **Important**: Remove `.barracuda.do.` from the end if NIC.DO automatically appends the domain
   - Some DNS providers want just the subdomain part: `_abc123def456789.www`
4. **Value**: Enter the full AWS validation value (e.g., `_xyz789abc123def.acm-validations.aws.`)
5. **TTL**: Use default or set to 300 (5 minutes)
6. Save the record

### For barracuda.do (apex) validation:
1. Click "Add DNS Record" or similar
2. **Type**: Select `CNAME`
3. **Name**: Enter the name from Terraform output (e.g., `_abc123def456789`)
   - This is for the apex domain validation
4. **Value**: Enter the full AWS validation value
5. **TTL**: Use default or set to 300 (5 minutes)
6. Save the record

## Step 4: Add WWW CNAME Record

1. Click "Add DNS Record" or similar
2. **Type**: Select `CNAME`
3. **Name**: Enter `www`
4. **Value**: Enter the CloudFront distribution domain (e.g., `d1234567890abc.cloudfront.net`)
   - ⚠️ **Important**: Do NOT include `https://` - just the domain name
5. **TTL**: Use default or 300 seconds
6. Save the record

## Step 5: Set Up Apex Domain Forwarding (Phase 1)

Since we're not using Route 53 yet, set up URL forwarding for the apex domain:

1. Look for "URL Forwarding", "Domain Forwarding", or "Redirect" option in NIC.DO
2. Set up forwarding from `barracuda.do` to `https://www.barracuda.do`
3. Choose "301 Permanent Redirect" if asked
4. Enable HTTPS forwarding if available

**Alternative**: If URL forwarding isn't available, you may need to:
- Create an A record pointing to a redirect service
- Contact NIC.DO support for apex domain forwarding options

## Step 6: Verify DNS Propagation

After adding all records, wait for DNS propagation (5-30 minutes):

### Check DNS records:
```bash
# Check ACM validation records
dig _abc123def456789.www.barracuda.do CNAME
dig _abc123def456789.barracuda.do CNAME

# Check WWW CNAME
dig www.barracuda.do CNAME
```

### Online DNS checker:
Use tools like [whatsmydns.net](https://www.whatsmydns.net/) to check global propagation

## Step 7: Enable Certificate Validation in Terraform

Once DNS records are propagated:

1. Edit `terraform/acm.tf`
2. Uncomment the `aws_acm_certificate_validation` resource
3. Edit `terraform/cloudfront.tf` 
4. Uncomment the `depends_on` line
5. Apply Terraform again:

```bash
cd terraform
terraform apply
```

## Step 8: Test the Deployment

After certificate validation completes:

1. **Test HTTPS**: Visit `https://www.barracuda.do`
2. **Test apex forwarding**: Visit `https://barracuda.do` (should redirect to www)
3. **Verify S3 security**: Try accessing the S3 bucket directly - should be blocked
4. **Check certificate**: Verify SSL certificate is valid in browser

## Step 9: Final Pipeline Run

Trigger a deployment to sync the latest content:

1. Push to main branch or manually trigger GitHub Actions
2. Verify the pipeline completes successfully
3. Confirm CloudFront cache invalidation runs

## Troubleshooting

### Certificate validation fails:
- Double-check DNS record names and values
- Ensure no extra dots or domain suffixes
- Wait up to 30 minutes for DNS propagation
- Check AWS Certificate Manager console for status

### WWW subdomain not working:
- Verify CNAME points to correct CloudFront distribution
- Check CloudFront distribution is deployed (not "In Progress")
- Confirm alternate domain names include www.barracuda.do

### Apex domain issues:
- Verify URL forwarding is properly configured
- Test the redirect with curl: `curl -I http://barracuda.do`
- Contact NIC.DO support if forwarding options are limited

### DNS record format issues:
Different DNS providers have varying formats:
- Some want just the subdomain part (e.g., `www`, `_validation.www`)
- Others want the full domain (e.g., `www.barracuda.do`, `_validation.www.barracuda.do`)
- Try both formats if one doesn't work

## Common NIC.DO Interface Tips

- Look for "DNS Zone", "DNS Management", or "Name Servers" section
- Some interfaces separate record types into different tabs
- TTL (Time To Live) can usually be left as default
- Save/Apply changes - some providers require confirmation
- Check for validation or syntax errors before saving

## Next Steps (Phase 2)

After this setup works:
1. Plan Route 53 migration when ready to change nameservers
2. Create Route 53 hosted zone
3. Update nameservers at domain registrar
4. Use ALIAS records for apex domain pointing to CloudFront

---

**Need help?** Check the Terraform outputs again with:
```bash
cd terraform && terraform output nic_do_dns_instructions
```