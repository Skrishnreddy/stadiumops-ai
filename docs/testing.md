# StadiumOps AI Testing Documentation

## Test Categories

We maintain test coverage across backend business logic, validation schemas, status pipelines, security restrictions, and UI states.

### 1. Backend Service Unit Tests (`tests/backend/test_services.py`)
- **Rule-Based Heuristic Matching**: Validates the regex keyword matching logic for medical, fire, crowd, and other standard events. Ensures accurate fallback results.
- **SOP Selection Logic**: Confirms correct SOP mapping by category and checks fallback paths (e.g. text containing "evacuation" returns the evacuation checklist).
- **Prompt Injection Defense**: Verifies that requests containing system hijack commands raise a `PromptInjectionException`.

### 2. Integration API Tests (`tests/backend/test_endpoints.py`)
- **Liveness probe**: Verifies that `/api/health` queries connection checks successfully.
- **Incident reporting pipeline**: Tests that a standard post request correctly populates SQLAlchemy models, runs fallback logic when Gemini is unconfigured, and writes the initial audit record.
- **Input range restrictions**: Verifies that text descriptions under 10 characters or over 2000 characters trigger 422 validations.
- **Status workflow restrictions**: Fuzzes the state machine transitions. Valid moves (e.g. `Open` -> `Acknowledged`) succeed, while invalid jumps (e.g. `Closed` -> `Open`) return a 400.
- **Multilingual translations**: Verifies that drafts can be created, stored, and marked as approved by an operations manager.
- **Post-Incident document creation**: Compiles Markdown files and validates the presence of audit grids.
- **IP-based request rate limiting**: Simulates a high-frequency call block (exceeding custom limiter bounds) and asserts that the server rejects requests with a `429 Too Many Requests`.

## Mocking Gemini

In the test environment, since `GEMINI_API_KEY` is not present, the `GeminiService` class detects this and automatically defaults to the `RuleBasedClassifier` engine. This acts as a complete local mock, ensuring tests never hit the public Google endpoints or require live API keys to complete successfully.

## Executing Tests

To run the backend tests, execute:
```bash
pytest backend/ -v
```
To run tests with code coverage metrics:
```bash
pytest backend/ --cov=backend
```
