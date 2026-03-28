from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps.github_client import get_github_client
from app.schemas.repo import RepoResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.repository_store import save_repo_snapshot

router = APIRouter(prefix="/repo", tags=["repo"])


async def _github_get_json(
    gh: GitHubClient,
    path: str,
    *,
    params: dict[str, Any] | None = None,
) -> Any:
    try:
        return await gh.request_json("GET", path, params=params)
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


# --- Paths below are declared before `/{owner}/{repo}` so FastAPI matches the most specific route first.
# All of these proxy the GitHub REST API and return JSON as GitHub does (see lead openapi.yaml).


@router.get("/{owner}/{repo}/commits")
async def get_commits(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/commits",
        params={"per_page": per_page},
    )


@router.get("/{owner}/{repo}/contributors")
async def get_contributors(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/contributors",
        params={"per_page": per_page},
    )


@router.get("/{owner}/{repo}/languages")
async def get_languages(owner: str, repo: str, gh: GitHubClient = Depends(get_github_client)) -> Any:
    return await _github_get_json(gh, f"/repos/{owner}/{repo}/languages")


@router.get("/{owner}/{repo}/issues")
async def get_issues(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    state: str = Query(default="open"),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    if state not in ("open", "closed", "all"):
        raise HTTPException(status_code=422, detail="state must be open, closed, or all")
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/issues",
        params={"state": state, "per_page": per_page},
    )


@router.get("/{owner}/{repo}/pulls")
async def get_pulls(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    state: str = Query(default="open"),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    if state not in ("open", "closed", "all"):
        raise HTTPException(status_code=422, detail="state must be open, closed, or all")
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/pulls",
        params={"state": state, "per_page": per_page},
    )


@router.get("/{owner}/{repo}/branches")
async def get_branches(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/branches",
        params={"per_page": per_page},
    )


@router.get("/{owner}/{repo}/tags")
async def get_tags(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/tags",
        params={"per_page": per_page},
    )


@router.get("/{owner}/{repo}/activity")
async def get_activity(owner: str, repo: str, gh: GitHubClient = Depends(get_github_client)) -> Any:
    """Maps to GitHub `GET /repos/{owner}/{repo}/stats/commit_activity` (may return 202 while computing)."""
    try:
        resp = await gh.get_response(f"/repos/{owner}/{repo}/stats/commit_activity")
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    if resp.status_code == 202:
        raise HTTPException(
            status_code=503,
            detail="GitHub is still building commit activity statistics; try again in a few moments.",
        )
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text[:500])
    try:
        return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail="Invalid JSON from GitHub statistics") from e


@router.get("/{owner}/{repo}/issue-stats")
async def get_issue_stats(owner: str, repo: str, gh: GitHubClient = Depends(get_github_client)) -> Any:
    """
    Aggregated issue counts via GitHub Search API (not a single GitHub repo endpoint).
    Shape is stable for frontend use; documented here for co-developers.
    """
    q_base = f"repo:{owner}/{repo}+is:issue"
    open_r = await _github_get_json(gh, "/search/issues", params={"q": f"{q_base}+is:open", "per_page": 1})
    closed_r = await _github_get_json(gh, "/search/issues", params={"q": f"{q_base}+is:closed", "per_page": 1})
    if not isinstance(open_r, dict) or not isinstance(closed_r, dict):
        raise HTTPException(status_code=502, detail="Unexpected GitHub search response")
    return {
        "open_issues": int(open_r.get("total_count") or 0),
        "closed_issues": int(closed_r.get("total_count") or 0),
        "total_issues": int(open_r.get("total_count") or 0) + int(closed_r.get("total_count") or 0),
    }


@router.get("/{owner}/{repo}/tree")
async def get_tree(owner: str, repo: str, gh: GitHubClient = Depends(get_github_client)) -> Any:
    """Resolves default branch then returns `git/trees/{sha}?recursive=1` (GitHub API)."""
    repo_payload = await _github_get_json(gh, f"/repos/{owner}/{repo}")
    if not isinstance(repo_payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected repo response")
    branch = repo_payload.get("default_branch")
    if not isinstance(branch, str) or not branch:
        branch = "main"
    ref = await _github_get_json(gh, f"/repos/{owner}/{repo}/git/ref/heads/{branch}")
    if not isinstance(ref, dict):
        raise HTTPException(status_code=502, detail="Unexpected git ref response")
    obj = ref.get("object")
    if not isinstance(obj, dict):
        raise HTTPException(status_code=502, detail="Missing git ref object")
    sha = obj.get("sha")
    if not isinstance(sha, str):
        raise HTTPException(status_code=502, detail="Missing commit sha for default branch")
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/git/trees/{sha}",
        params={"recursive": "1"},
    )


@router.get("/{owner}/{repo}/stargazers")
async def get_stargazers(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_get_json(
        gh,
        f"/repos/{owner}/{repo}/stargazers",
        params={"per_page": per_page},
    )


@router.get("/{owner}/{repo}", response_model=RepoResponse)
async def get_repo(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
) -> RepoResponse:
    """
    Fetches live repository data from the GitHub API and saves a snapshot to the database.
 
    - owner: GitHub username or organisation (e.g. "torvalds")
    - repo:  Repository name (e.g. "linux")
 
    On success, saves the result as a RepositorySnapshot so the analytics
    endpoint can track changes over time.
 
    Raises:
    - 404/502 if GitHub returns an error (e.g. repo not found, rate limited)
    - 502 if the network request itself fails
    """
    try:
        payload: Any = await gh.request_json("GET", f"/repos/{owner}/{repo}")
    except GitHubApiError as e:
        # Use the status code from GitHub's response if available, otherwise 502
        status = e.status_code or 502
        raise HTTPException(status_code=status, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    # GitHub should always return a dict here, but guard against unexpected shapes
    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected GitHub response shape")

    # Safely extract topics — GitHub returns an empty list if none are set,
    # but we guard against None or non-list values just in case.
    topics = payload.get("topics")
    if not isinstance(topics, list):
        topics = []
    topics = [t for t in topics if isinstance(t, str)]

    result = RepoResponse(
        name=str(payload.get("name") or ""),
        # description and language can legitimately be None (not set on the repo)
        description=payload.get("description") if isinstance(payload.get("description"), str) else None,
        stars=int(payload.get("stargazers_count") or 0),
        forks=int(payload.get("forks_count") or 0),
        language=payload.get("language") if isinstance(payload.get("language"), str) else None,
        topics=topics,
    )

    # Persist this snapshot to the database so analytics can compare it
    # against future fetches of the same repo.
    await save_repo_snapshot(owner, repo, result)
    return result
