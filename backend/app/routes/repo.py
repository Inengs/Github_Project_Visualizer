from __future__ import annotations

from typing import Any, Annotated

import httpx

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response

from app.deps.github_client import get_github_client
from app.schemas.readme import GenerateReadmeRequest, GenerateReadmeResponse
from app.schemas.repo import ContributorResponse, RepoResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.github_cache import get_commit_activity_cached, get_json_cached
from app.services.readme_generator import generate_repository_readme
from app.schemas.repo import RepoResponse  

from app.services.repository_store import save_repo_snapshot
from app.dependencies import get_github_client

from fastapi import APIRouter, Depends, HTTPException, Query, Response
 

router = APIRouter(prefix="/repo", tags=["repo"])
# imported but not used 
# GH_CLIENT = Annotated[GitHubClient, Depends(get_github_client)]

# --- Paths below are declared before `/{owner}/{repo}` so FastAPI matches the most specific route first.
# GitHub JSON is cached in Redis when REDIS_URL is set (see app/services/github_cache.py).


async def _github_cached(
    gh: GitHubClient,
    response: Response,
    path: str,
    params: dict[str, Any] | None,
) -> Any:
    try:
        return await get_json_cached(
            gh=gh,
            path=path,
            params=params,
            token=gh.access_token,
            response=response,
        )
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e


@router.get("/{owner}/{repo}/commits")
async def get_commits(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/commits",
        {"per_page": per_page},
    )


@router.get("/{owner}/{repo}/contributors", response_model=list[ContributorResponse])
async def get_contributors(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> list[ContributorResponse]:
    """
    Proxies GitHub GET /repos/{owner}/{repo}/contributors (cached when Redis is enabled).
    Returns a stable subset of each contributor object.
    """
    
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/contributors",
        {"per_page": per_page},
    )
    if not isinstance(raw, list):
        raise HTTPException(status_code=502, detail="Unexpected GitHub contributors response shape")
    out: list[ContributorResponse] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        try:
            out.append(ContributorResponse.model_validate(item))
        except Exception:
            continue
    if len(raw) > 0 and len(out) == 0:
        raise HTTPException(status_code=502, detail="Could not parse any GitHub contributor rows")
    return out


@router.get("/{owner}/{repo}/languages")
async def get_languages(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
) -> Any:
    return await _github_cached(gh, response, f"/repos/{owner}/{repo}/languages", None)


@router.get("/{owner}/{repo}/issues")
async def get_issues(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    state: str = Query(default="open"),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    if state not in ("open", "closed", "all"):
        raise HTTPException(status_code=422, detail="state must be open, closed, or all")
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/issues",
        {"state": state, "per_page": per_page},
    )


@router.get("/{owner}/{repo}/pulls")
async def get_pulls(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    state: str = Query(default="open"),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    if state not in ("open", "closed", "all"):
        raise HTTPException(status_code=422, detail="state must be open, closed, or all")
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/pulls",
        {"state": state, "per_page": per_page},
    )


@router.get("/{owner}/{repo}/branches")
async def get_branches(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/branches",
        {"per_page": per_page},
    )


@router.get("/{owner}/{repo}/tags")
async def get_tags(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/tags",
        {"per_page": per_page},
    )


@router.get("/{owner}/{repo}/activity")
async def get_activity(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
) -> Any:
    try:
        return await get_commit_activity_cached(
            gh=gh,
            owner=owner,
            repo=repo,
            token=gh.access_token,
            response=response,
        )
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e


@router.get("/{owner}/{repo}/issue-stats")
async def get_issue_stats(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
) -> Any:
    q_base = f"repo:{owner}/{repo}+is:issue"
    open_r = await _github_cached(
        gh,
        Response(),
        "/search/issues",
        {"q": f"{q_base}+is:open", "per_page": 1},
    )
    closed_r = await _github_cached(
        gh,
        Response(),
        "/search/issues",
        {"q": f"{q_base}+is:closed", "per_page": 1},
    )
    if not isinstance(open_r, dict) or not isinstance(closed_r, dict):
        raise HTTPException(status_code=502, detail="Unexpected GitHub search response")
    return {
        "open_issues": int(open_r.get("total_count") or 0),
        "closed_issues": int(closed_r.get("total_count") or 0),
        "total_issues": int(open_r.get("total_count") or 0) + int(closed_r.get("total_count") or 0),
    }


@router.get("/{owner}/{repo}/tree")
async def get_tree(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
) -> Any:
    _noop = Response()
    repo_payload = await _github_cached(gh, _noop, f"/repos/{owner}/{repo}", None)
    if not isinstance(repo_payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected repo response")
    branch = repo_payload.get("default_branch")
    if not isinstance(branch, str) or not branch:
        branch = "main"
    ref = await _github_cached(gh, _noop, f"/repos/{owner}/{repo}/git/ref/heads/{branch}", None)
    if not isinstance(ref, dict):
        raise HTTPException(status_code=502, detail="Unexpected git ref response")
    obj = ref.get("object")
    if not isinstance(obj, dict):
        raise HTTPException(status_code=502, detail="Missing git ref object")
    sha = obj.get("sha")
    if not isinstance(sha, str):
        raise HTTPException(status_code=502, detail="Missing commit sha for default branch")
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/git/trees/{sha}",
        {"recursive": "1"},
    )


@router.get("/{owner}/{repo}/stargazers")
async def get_stargazers(
    owner: str,
    repo: str,
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
    per_page: int = Query(default=30, ge=1, le=100),
) -> Any:
    return await _github_cached(
        gh,
        response,
        f"/repos/{owner}/{repo}/stargazers",
        {"per_page": per_page},
    )


@router.post("/{owner}/{repo}/generate-readme", response_model=GenerateReadmeResponse)
async def post_generate_readme(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
    body: GenerateReadmeRequest | None = Body(default=None),
) -> GenerateReadmeResponse:
    """
    Build a structured README from live GitHub data, optional DB snapshots, and heuristics.
    Optional OpenAI narrative when `use_openai` is true and an API key is supplied (body or server env).
    """
    opts = body or GenerateReadmeRequest()
    try:
        return await generate_repository_readme(owner, repo, github_client=gh, options=opts)
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.get("/{owner}/{repo}", response_model=RepoResponse)
async def get_repo(
    owner: str,
    repo: str,
    gh: GH_CLIENT,
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



# GET CONTRIBUTORS TO THE GITHUB REPOSITORY

from fastapi import Query
from app.schemas.repo import ContributorResponse
from app.services.contributors import fetch_stats, build_contributor

@router.get('/api/repo/{owner}/{repo}/contributors', 
            response_model=ContributorResponse)
async def get_contributors(
    owner: str,
    repo: str,
    gh: GH_CLIENT,
    per_page: int = Query(default=30, ge=1, le=100),
    page: int = Query(default=1, ge=1)
) -> ContributorResponse:
    
    """
    Fetches contributor data for a repository from the GitHub API.

    - owner: GitHub username or organisation
    - repo:  Repository name

    Also attempts to fetch detailed commit stats (additions/deletions).
    Stats may be absent if GitHub is still computing them (202 response).

    Raises:
    - 404/502 if GitHub returns an error (e.g. repo not found, rate limited)
    - 502 if the network request itself fails
    """

    try:
        payload: Any = await gh.request_json(
            "GET",
            f"/repos/{owner}/{repo}/contributors",
            params={"per_page": per_page, "page": page},
        )
    except GitHubApiError as e:
        status = e.status_code or 502
        raise HTTPException(status_code=status, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    
    stats_map = await fetch_stats(gh, owner, repo)

    
    contributors = [
        build_contributor(c, stats_map)
        for c in payload
        if isinstance(c, dict)
    ]

    return ContributorResponse(
        owner=owner,
        repo=repo,
        total_contributors=len(contributors),
        contributors=contributors,
    )

    
