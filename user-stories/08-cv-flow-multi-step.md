User Story 8: Implement Multi-Step CV Generation Flow

Why: As a recruiter, I want to be guided through a simple multi-step process to provide job details, so the bot can give me a complete and accurate analysis of the candidate's fit.

Description: This implements the full, multi-step CV flow, from data collection to final analysis.

Step 1 (Trigger): User clicks the "Dynamic CV" button. The backend responds with next_action: "RENDER_WIDGET_FORM" and widget_data for a form asking for company_name, job_title, and job_url (optional).

Step 2 (Data Collection): User submits Form 1. The backend receives this data and immediately responds with a second form: next_action: "RENDER_WIDGET_FORM" and widget_data for a large job_description (Markdown) textarea.

(Pragmatic Deferral: For now, this textarea will be empty. A future story, US-10, will add web scraping to pre-fill it from the job_url.)

Step 3 (Analysis): User submits Form 2 (the description). The backend now has all the data. It performs the full analysis (RAG on master resume/interests) and responds with next_action: "RENDER_CV_ANALYSIS" and widget_data containing the final JSON object (interest_score, honest_match_text, custom_resume_text).

Frontend (UI): Create a new component, CVAnalysisView.jsx, to display the final analysis.

Frontend (Logic): The ChatbotUI.jsx must now manage this multi-step state, rendering Form 1, then Form 2, and finally the <CVAnalysisView /> component.

Validation:

GIVEN I click "Dynamic CV".

THEN I am shown a form for "Company Name", "Job Title", and "URL".

WHEN I fill out and submit this form.

THEN the chat immediately shows a new form, asking for the "Job Description".

WHEN I fill out and submit the description.

THEN the chat renders the final analysis, showing the Score, Honest Match Text, and Custom Resume.

AND the normal chat input is hidden during this entire process.