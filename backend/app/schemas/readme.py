from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class ReadmeExportFormat(str, Enum):
    markdown = "markdown"
    html = "html"
    both = "both"


class GenerateReadmeRequest(BaseModel):
    """Options for README generation. Sensitive fields are never logged."""

    template_id: str = Field(default="default", description="Reserved for future template packs.")
    export_format: ReadmeExportFormat = Field(
        default=ReadmeExportFormat.both,
        description="Return markdown only, HTML only, or both.",
    )
    use_openai: bool = Field(
        default=False,
        description="If true, requests an extra narrative from OpenAI when an API key is available.",
    )
    openai_api_key: str | None = Field(
        default=None,
        description="Optional user-supplied key; overrides server OPENAI_API_KEY for this request.",
    )


class GenerateReadmeResponse(BaseModel):
    markdown: str
    html: str | None = None
    template_id: str
    used_openai: bool
    pdf_export_hint: str = (
        "For PDF: open the HTML view in a browser and use Print → Save as PDF (or Microsoft Print to PDF)."
    )
