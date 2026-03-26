from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

import httpx

from app.config import GITHUB_TOKEN


GitHubHttpMethod = Literal["GET", "POST", "PUT", "PATCH", "DELETE"]


@dataclass(frozen=True, slots=True)
class GitHubApiError(Exception):
    status_code: int | None
    message: str
    url: str | None = None
    documentation_url: str | None = None
    response_text: str | None = None

    def __str__(self) -> str:
        base = f"GitHub API error"
        if self.status_code is not None:
            base += f" ({self.status_code})"
        if self.url:
            base += f" for {self.url}"
        return f"{base}: {self.message}"


class GitHubClient:
    """
    Small wrapper around httpx.AsyncClient for GitHub REST API calls.

    - Attaches Authorization header when GITHUB_TOKEN is present
    - Centralizes error handling (HTTP status, network errors, timeouts)
    """

    def __init__(
        self,
        *,
        token: str | None = GITHUB_TOKEN,
        base_url: str = "https://api.github.com",
        timeout_s: float = 20.0,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._token = token
        self._base_url = base_url.rstrip("/")
        self._timeout_s = timeout_s
        self._client = client
        self._owns_client = client is None

    async def __aenter__(self) -> GitHubClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                timeout=httpx.Timeout(self._timeout_s),
                headers=self._default_headers(),
            )
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None

    def _default_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "github-project-visualizer",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return headers

    def _parse_github_error(self, response: httpx.Response) -> GitHubApiError:
        message = "Request failed"
        documentation_url: str | None = None
        response_text: str | None = None

        try:
            payload = response.json()
            if isinstance(payload, dict):
                msg = payload.get("message")
                if isinstance(msg, str) and msg.strip():
                    message = msg
                doc = payload.get("documentation_url")
                if isinstance(doc, str) and doc.strip():
                    documentation_url = doc
            else:
                response_text = response.text
        except Exception:
            response_text = response.text

        return GitHubApiError(
            status_code=response.status_code,
            message=message,
            url=str(response.request.url) if response.request else None,
            documentation_url=documentation_url,
            response_text=response_text,
        )

    async def request_json(
        self,
        method: GitHubHttpMethod,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """
        Make a GitHub API request and return decoded JSON.
        Raises GitHubApiError on non-2xx or network failures.
        """
        if self._client is None:
            async with self:
                return await self.request_json(
                    method,
                    url,
                    params=params,
                    json=json,
                    headers=headers,
                )

        try:
            resp = await self._client.request(
                method,
                url,
                params=params,
                json=json,
                headers=headers,
            )
        except (httpx.TimeoutException, httpx.NetworkError) as e:
            raise GitHubApiError(status_code=None, message=str(e), url=url) from e

        if resp.is_error:
            raise self._parse_github_error(resp)

        try:
            return resp.json()
        except Exception as e:
            raise GitHubApiError(
                status_code=resp.status_code,
                message="Invalid JSON in GitHub response",
                url=str(resp.request.url) if resp.request else url,
                response_text=resp.text,
            ) from e

