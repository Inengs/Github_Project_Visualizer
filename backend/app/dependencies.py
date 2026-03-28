from collections.abc import AsyncGenerator
from app.services.github import GitHubClient

async def get_github_client() -> AsyncGenerator[GitHubClient, None]:
    """Provide a GitHubClient per request with automatic cleanup.
    
    Uses async generator pattern (recommended by FastAPI) so the client is:
    - Created and set up before the endpoint runs
    - Automatically closed after the endpoint finishes (even on errors)
    """
    async with GitHubClient() as client:
        yield client