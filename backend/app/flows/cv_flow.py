"""
CV Flow: Job scraping and resume generation.

This flow handles:
1. Scraping job information from URLs
2. Generating tailored resumes based on job requirements
"""
import logging
import uuid
from fastapi import HTTPException
from fastapi.responses import JSONResponse

from ..gemini_service import gemini_service
from ..rag_service import rag_service
from ..resume_models import StructuredResume, Language
from .. import prompts
from .. import storage
from ..models import JobScrapingRequest, JobScrapingResponse

logger = logging.getLogger(__name__)


async def handle_job_scraping(request: JobScrapingRequest) -> JobScrapingResponse:
    """
    Extract job information from URL using Gemini's URL context feature.

    Args:
        request: JobScrapingRequest with job_url

    Returns:
        JobScrapingResponse with extracted job information

    Raises:
        HTTPException: If service unavailable or extraction fails
    """
    if not gemini_service.is_available():
        raise HTTPException(status_code=500, detail="Gemini service not initialized")

    job_url = request.job_url.strip()

    if not job_url:
        raise HTTPException(status_code=400, detail="job_url is required")

    logger.info(f"Scraping job URL: {job_url}")

    # Get prompt and schema from prompts module
    prompt = prompts.get_job_scraping_prompt(job_url)
    schema = prompts.JOB_SCRAPING_SCHEMA

    try:
        parsed_data = gemini_service.generate_structured_output_with_url(
            prompt, schema, temperature=0.2
        )

        if parsed_data:
            logger.info("✓ Job information extracted from URL")
            return JobScrapingResponse(
                company_name=parsed_data.get("company_name", ""),
                job_title=parsed_data.get("job_title", ""),
                job_description=parsed_data.get("job_description", ""),
                main_missions=parsed_data.get("main_missions", ""),
                qualifications=parsed_data.get("qualifications", ""),
                additional_info=parsed_data.get("additional_info", ""),
            )
        else:
            logger.warning("URL extraction failed")
            raise HTTPException(
                status_code=500,
                detail="Impossible d'extraire les informations de cette URL"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting from URL: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de l'extraction de l'URL. L'URL est peut-être privée ou bloquée."
        )


async def handle_cv_generation(form_data: dict) -> JSONResponse:
    """
    Generate tailored resume from complete job data.

    Args:
        form_data: Dictionary containing job information and recruiter details

    Returns:
        JSONResponse with resume analysis and resume_id

    Raises:
        HTTPException: If generation fails or required data missing
    """
    logger.info("Using DYNAMIC_CV flow - Generating resume")

    # Extract all data from form_data
    company_name = form_data.get("company_name", "")
    job_title = form_data.get("job_title", "")
    job_description = form_data.get("job_description", "")
    main_missions = form_data.get("main_missions", "")
    qualifications = form_data.get("qualifications", "")
    additional_info = form_data.get("additional_info", "")

    # Validate required fields
    if not company_name or not job_title or not job_description:
        raise HTTPException(
            status_code=400,
            detail="company_name, job_title, and job_description are required"
        )

    logger.info(f"Generating resume for {job_title} at {company_name}")

    # Use RAG to retrieve candidate information
    candidate_info_query = "Youssef Benkirane resume information, work experience, education, skills, projects, contact details, languages"

    if not rag_service.is_available():
        logger.warning("RAG service not available - cannot generate resume")
        raise HTTPException(
            status_code=500,
            detail="Resume generation requires candidate data to be loaded. Please contact support.",
        )

    logger.info("Retrieving candidate information from RAG...")
    results = rag_service.search(candidate_info_query, top_k=10, similarity_threshold=0.2)

    if not results:
        logger.warning("No candidate information found in RAG")
        raise HTTPException(
            status_code=500,
            detail="No candidate information available. Please contact support.",
        )

    candidate_info = [doc["chunk"] for doc in results]
    logger.info(f"✓ Retrieved {len(candidate_info)} candidate information chunks")

    # Build context from candidate information
    candidate_context = "\n\n".join(candidate_info)

    # Build comprehensive job description
    full_job_description = f"""**Description du poste:**
{job_description}

**Missions principales:**
{main_missions}

**Qualifications requises:**
{qualifications}"""

    if additional_info:
        full_job_description += f"""

**Informations complémentaires:**
{additional_info}"""

    # Get CV generation prompt from prompts module
    prompt = prompts.get_cv_generation_prompt(
        candidate_context=candidate_context,
        company_name=company_name,
        job_title=job_title,
        full_job_description=full_job_description
    )

    # Get JSON schema from Pydantic model
    resume_schema = StructuredResume.model_json_schema()

    # Generate structured output
    structured_data = gemini_service.generate_structured_output(
        prompt=prompt, response_schema=resume_schema, temperature=0.4
    )

    if not structured_data:
        logger.error("Failed to generate structured resume")
        raise HTTPException(
            status_code=500, detail="Failed to generate resume. Please try again."
        )

    # Parse structured data into Pydantic model
    try:
        resume = StructuredResume(**structured_data)
    except Exception as e:
        logger.error(f"Failed to parse structured resume: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse resume data. Please try again.",
        )

    # Override contact info with hardcoded values (always the same)
    resume.contact_info.name = "Youssef Benkirane"
    resume.contact_info.city = "Toulouse, France"
    resume.contact_info.phone = "(+33) 7 63 99 17 47"
    resume.contact_info.email = "youssef@growthwithflow.com"

    # Override languages with hardcoded values (always the same)
    resume.languages = [
        Language(language="Français", proficiency="Langue Maternelle"),
        Language(language="Anglais", proficiency="Maîtrise Professionnelle")
    ]

    logger.info("✓ Applied hardcoded contact info and languages")

    # Store resume data with unique ID
    resume_id = str(uuid.uuid4())
    storage.store_resume(resume_id, resume.model_dump())

    # Return analysis view with resume data
    return JSONResponse(
        {
            "next_action": "RENDER_ANALYSIS",
            "widget_data": {
                "resume_id": resume_id,
                "company_name": company_name,
                "job_title": job_title,
                "match_score": resume.match_analysis.score,
                "match_tag": resume.match_analysis.tag,
                "intro_message": resume.match_analysis.intro_message,
                "key_strengths": resume.match_analysis.key_strengths,
                "points_of_attention": resume.match_analysis.points_of_attention,
                "current_step": 11,
                "total_steps": 11,
            },
        }
    )
