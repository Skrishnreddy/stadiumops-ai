import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("stadiumops")

class StadiumOpsException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class IncidentNotFoundException(StadiumOpsException):
    def __init__(self, incident_id: str):
        super().__init__(
            message=f"Incident with ID {incident_id} not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

class InvalidStatusTransitionException(StadiumOpsException):
    def __init__(self, from_status: str, to_status: str):
        super().__init__(
            message=f"Invalid status transition from '{from_status}' to '{to_status}'.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

class PromptInjectionException(StadiumOpsException):
    def __init__(self):
        super().__init__(
            message="Input text rejected due to potential prompt injection markers.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

class RateLimitExceededException(StadiumOpsException):
    def __init__(self):
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )

def register_exception_handlers(app):
    @app.exception_handler(StadiumOpsException)
    async def stadiumops_exception_handler(request: Request, exc: StadiumOpsException):
        logger.warning(f"Application error on {request.url.path}: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred."}
        )
