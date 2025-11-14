"""
Pydantic models for structured resume generation using Gemini.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """Contact information for resume header."""

    name: str = Field(description="Full name")
    job_title: str = Field(description="Target job title from the application")
    city: str = Field(description="City and country")
    email: str = Field(description="Email address")
    phone: str = Field(description="Phone number")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL")
    portfolio: Optional[str] = Field(default=None, description="Portfolio/website URL")


class SkillsSection(BaseModel):
    """Categorized skills section."""

    product_skills: List[str] = Field(
        default_factory=list, description="Product management and strategy skills"
    )
    tools: List[str] = Field(default_factory=list, description="Tools and software")
    technical_skills: List[str] = Field(
        default_factory=list, description="Technical and development skills"
    )
    soft_skills: List[str] = Field(
        default_factory=list, description="Soft skills and competencies"
    )


class ExperienceItem(BaseModel):
    """A single work experience entry."""

    job_title: str = Field(description="Job title/position")
    company: str = Field(description="Company name")
    location: str = Field(description="Location (city, country)")
    duration: str = Field(description="Duration (e.g., 'Jan 2020 - Present')")
    achievements: List[str] = Field(
        description="Key achievements and impact (3-5 bullet points)"
    )


class EducationItem(BaseModel):
    """A single education entry."""

    degree: str = Field(description="Degree name")
    school: str = Field(description="School/University name")
    location: str = Field(description="Location")
    year: str = Field(description="Graduation year or duration")


class ProjectItem(BaseModel):
    """A portfolio/project entry."""

    title: str = Field(description="Project title")
    description: str = Field(description="Brief description of the project")
    technologies: List[str] = Field(
        default_factory=list, description="Technologies/tools used"
    )
    impact: str = Field(description="Impact or outcome of the project")


class Language(BaseModel):
    """Language proficiency entry."""

    language: str = Field(description="Language name")
    proficiency: str = Field(
        description="Proficiency level (e.g., Native, Fluent, Professional, Basic)"
    )


class MatchScore(BaseModel):
    """Match score and explanation."""

    score: int = Field(ge=0, le=100, description="Match score from 0-100")
    tag: str = Field(
        description="Personalized tag chosen from: 'On est fait pour travailler ensemble', 'Un profil très solide pour ce poste', 'Quelques ajustements, mais un bon match'"
    )
    intro_message: str = Field(
        description="Simple, clear message (2-4 sentences) addressed to the recruiter explaining why the profile is a good match, highlighting most relevant skills/experiences for the offer"
    )
    key_strengths: List[str] = Field(
        description="2-4 most relevant skills/experiences that match the job offer (e.g., 'Très à l'aise avec les clients et les besoins business')"
    )
    points_of_attention: List[str] = Field(
        description="1-2 experiences/domains mentioned by client in the job offer that candidate doesn't have (e.g., 'Moins d\\'expérience dans le secteur santé, mentionné dans l\\'annonce')"
    )


class StructuredResume(BaseModel):
    """Complete structured resume with all sections."""

    contact_info: ContactInfo
    professional_summary: str = Field(
        description="3-4 line professional summary highlighting value proposition"
    )
    key_skills: SkillsSection
    professional_experience: List[ExperienceItem] = Field(
        description="Work experience in reverse chronological order"
    )
    education: List[EducationItem] = Field(description="Educational background")
    projects: List[ProjectItem] = Field(
        description="1-2 key portfolio projects showing initiative"
    )
    languages: List[Language] = Field(description="Language proficiencies")
    match_analysis: MatchScore = Field(
        description="Analysis of how well the candidate matches the job"
    )
