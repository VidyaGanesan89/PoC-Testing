# Azure DevOps Integration Security Best Practices

## Authentication
- Prefer short-lived OAuth tokens in production; use PAT only for local/dev scenarios.
- Store `AZURE_DEVOPS_PAT` and `AZURE_DEVOPS_OAUTH_TOKEN` in secure secret stores (Azure Key Vault, CI secrets), never in source files.
- Rotate PATs frequently and scope them to minimum permissions (Work Items read/write only).

## Authorization and Least Privilege
- Use dedicated service accounts for automation.
- Restrict project access to `P8AG_Emp_comms` unless cross-project access is required.
- Avoid organization-wide scopes for PAT/OAuth apps.

## Logging and Privacy
- Never log tokens, authorization headers, or full request payloads containing secrets.
- Log only metadata for troubleshooting: endpoint, status code, work item IDs, correlation IDs.
- Redact user-provided prompt content if it can include sensitive data.

## Input Validation
- Validate incoming work item IDs as positive integers.
- Enforce allow-list for mutable fields (`State`, `Assigned To`, `Priority`, `Test Status`).
- Sanitize comment strings and descriptions to prevent unsafe content injection.

## Resilience
- Use request timeouts and retry only on transient failures.
- Surface clear 4xx vs 5xx responses to callers.
- Use structured errors for monitoring and incident response.

## Operational Controls
- Enable audit trails in Azure DevOps for all service-account actions.
- Add CI checks to ensure no secrets are committed.
- Periodically review and revoke unused credentials.
