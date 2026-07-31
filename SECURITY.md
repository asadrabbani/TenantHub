# Security policy

## Supported version

Security fixes are applied to the latest version on the `main` branch.

## Reporting an issue

Please do not publish credentials or a working exploit in a public issue. Contact the repository owner privately with the affected route, reproduction steps, and expected impact.

## Deployment checklist

- Generate a unique, high-entropy `JWT_SECRET`.
- Use a dedicated MongoDB user with the minimum required permissions.
- Set `CLIENT_ORIGIN` to the exact production web origin.
- Store payment, mapping, database, and webhook credentials in the host's secret manager.
- Rotate any credential that has ever been committed or shared publicly.
- Serve both client and API over HTTPS.
