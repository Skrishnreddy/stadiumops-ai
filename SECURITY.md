# Security Policy

## Threat Model

StadiumOps AI operates in a smart stadium context where operations managers, zone supervisors, and responders interact with incidents. The primary security threats identified are:

1. **Prompt Injection**: Malicious reports designed to hijack the Gemini API to output rogue instructions, false priorities, or bypass security rules.
2. **API Key Exposure**: Leaking the `GEMINI_API_KEY` to the client-side browser or public GitHub repository.
3. **Denial of Service (DoS)**: Flooding the backend APIs with high volumes of fake incident reports or status updates.
4. **Unauthorized Status Transitions**: Tampering with API requests to bypass logical status progressions (e.g. marking an unresolved issue as Closed directly).
5. **Cross-Site Scripting (XSS)**: Injecting script tags into incident descriptions that execute in the operations console.

## Security Controls

We implement the following defenses:

- **Strict Environment Separation**: All AI operations run strictly on the server side. The Gemini API Key is never exposed to the frontend.
- **Prompt Guard & Length Limits**: All inputs are length-constrained (<2000 chars) and checked for command words.
- **Rule-Based Fallback Classifier**: If an API call fails or times out, the backend gracefully runs a rule-based engine to prevent service denial.
- **Human-in-the-loop**: Public announcements and post-incident reports require manual operations manager approval before they can be finalized.
- **Middleware Protections**:
  - CORS policies restricted to expected client domains.
  - Rate limiting per client IP.
  - Secure headers added to all HTTP responses (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
- **Input Validation**: All requests are validated against strict Pydantic schemas.
- **State Transition Constraints**: The incident state machine validates all updates against allowed paths.

## Known Limitations

- The database is SQLite for prototyping. In production, this should be migrated to Cloud SQL (PostgreSQL) with proper authentication.
- Simple API rate limiting is IP-based and should be backed by Redis in a distributed environment.

## Responsible Disclosure

If you find a vulnerability, please do not open a public issue. Report it to safety@stadiumops-ai.example.com. We aim to respond within 48 hours.
