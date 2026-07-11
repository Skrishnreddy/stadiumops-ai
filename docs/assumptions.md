# StadiumOps AI Assumptions & Limitations

## Core Assumptions

1. **Tournament Environment**: The application assumes a single-stadium setup configured specifically for the FIFA World Cup 2026 Azteca Stadium. Multi-stadium operations are out of scope for the MVP.
2. **Access Control**: Users interact with the app via client-side simulated roles (Sofia: Operations Manager, Marcus: Zone Responder, Elena: Compliance Auditor). Full role-based authorization (e.g. JWT and OAuth2 validation) is bypassed in this prototype for simplicity.
3. **Connectivity**: Devices in the stadium command center are assumed to have a modern local network connection. In case of local network failure, the frontend operates offline in memory and the backend uses offline ticket scan logs.
4. **Data Durability**: A local SQLite database file (`stadiumops.db`) is adequate for prototyping. Since SQLite locks the file during writes, it assumes low concurrency.

## Technical Limitations

- **Simulated Real-Time Updates**: To avoid massive WebSockets setup dependencies (maintaining a lightweight footprint < 10 MB), the dashboard statistics refresh manually or via standard polling.
- **Mock Broadcaster**: Public broadcasts (announcements) are marked in the database and logged to the audit log. Actual interfaces to stadium PA systems or jumbo screens are mocked.
- **Lightweight Knowledge Base**: The standard SOP documents are stored inside `backend/app/data/sops.json` instead of a full vector database (like Chroma or pgvector) to remain below the 10 MB submission limit.
- **Rate Limiter Storage**: The sliding-window rate limiter stores timestamps in local RAM. If the backend restarts, the rate-limiting history is reset.
