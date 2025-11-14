import { useState, useEffect, useRef } from "react";
import "./ResumeModal.css";

const API_BASE_URL = "http://localhost:8000";

function ResumeModal({ resumeId, onClose }) {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resumeRef = useRef(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/resume/${resumeId}`);
        if (!response.ok) {
          throw new Error("Resume not found");
        }
        const data = await response.json();
        setResumeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId]);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    const element = resumeRef.current;
    const opt = {
      margin: 0,
      filename: `CV_Youssef_Benkirane_${resumeData.contact_info.job_title.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // @ts-ignore - html2pdf will be loaded from CDN
    window.html2pdf().set(opt).from(element).save();
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "resume-modal-overlay") {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="resume-modal-overlay" onClick={handleOverlayClick}>
        <div className="resume-modal-content">
          <div className="loading">Loading resume...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-modal-overlay" onClick={handleOverlayClick}>
        <div className="resume-modal-content">
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData) return null;

  return (
    <div className="resume-modal-overlay" onClick={handleOverlayClick}>
      <div className="resume-modal-content">
        <div className="resume-modal-header">
          <h2>Your Generated Resume</h2>
          <div className="resume-modal-actions">
            <button className="btn-download" onClick={handleDownloadPDF}>
              📥 Download PDF
            </button>
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="resume-modal-body">
          <div className="resume-preview" ref={resumeRef}>
            <div className="resume-grid">
              {/* LEFT COLUMN - Sidebar */}
              <div className="resume-sidebar">
                <div className="resume-header-sidebar">
                  <h1 className="resume-name">
                    {resumeData.contact_info.name}
                  </h1>
                  <h2 className="resume-job-title">
                    {resumeData.contact_info.job_title}
                  </h2>
                </div>

                <div className="resume-section">
                  <p className="summary-text">
                    {resumeData.professional_summary}
                  </p>
                </div>

                <div className="resume-section">
                  <h3 className="section-title">Contact</h3>
                  <div className="contact-items">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <span>{resumeData.contact_info.email}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📱</span>
                      <span>{resumeData.contact_info.phone}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📍</span>
                      <span>{resumeData.contact_info.city}</span>
                    </div>
                  </div>
                </div>

                {resumeData.languages && resumeData.languages.length > 0 && (
                  <div className="resume-section">
                    <h3 className="section-title">Langues</h3>
                    {resumeData.languages.map((lang, idx) => (
                      <div key={idx} className="language-item">
                        <strong>{lang.language}</strong>
                        <p className="language-level">{lang.proficiency}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.key_skills.tools &&
                  resumeData.key_skills.tools.length > 0 && (
                    <div className="resume-section">
                      <h3 className="section-title">Outils</h3>
                      <div className="tools-grid">
                        {resumeData.key_skills.tools
                          .slice(0, 10)
                          .map((tool, idx) => (
                            <div key={idx} className="tool-item">
                              {tool}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* RIGHT COLUMN - Main Content */}
              <div className="resume-main">
                <div className="resume-section">
                  <h3 className="section-title-main">Expériences</h3>
                  {resumeData.professional_experience
                    .slice(0, 2)
                    .map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="experience-header">
                          <h4 className="experience-title">{exp.job_title}</h4>
                          <p className="experience-meta">
                            {exp.duration} | {exp.location}
                          </p>
                        </div>
                        <p className="experience-company">{exp.company}</p>
                        {exp.description && (
                          <p className="experience-description">
                            {exp.description}
                          </p>
                        )}
                        <ul className="achievements-list">
                          {exp.achievements
                            .slice(0, 4)
                            .map((achievement, aidx) => (
                              <li key={aidx}>{achievement}</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </div>

                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div className="resume-section">
                    <h3 className="section-title-main">Derniers projets</h3>
                    {resumeData.projects.slice(0, 2).map((project, idx) => (
                      <div key={idx} className="project-item">
                        <h4 className="project-title">{project.title}</h4>
                        <p className="project-description">
                          {project.description}
                        </p>
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <p className="project-tech">
                              <em>
                                Technologies:{" "}
                                {project.technologies.slice(0, 5).join(", ")}
                              </em>
                            </p>
                          )}
                        {project.achievements &&
                          project.achievements.length > 0 && (
                            <ul className="achievements-list">
                              {project.achievements
                                .slice(0, 3)
                                .map((achievement, aidx) => (
                                  <li key={aidx}>{achievement}</li>
                                ))}
                            </ul>
                          )}
                        {project.impact && (
                          <p className="project-impact">
                            <strong>Résultats:</strong> {project.impact}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="resume-section">
                  <h3 className="section-title-main">Formation</h3>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="education-item">
                      <h4 className="education-school">{edu.school}</h4>
                      <p className="education-degree">{edu.degree}</p>
                      <p className="education-year">{edu.year}</p>
                      {edu.details && edu.details.length > 0 && (
                        <ul className="education-details">
                          {edu.details.slice(0, 2).map((detail, didx) => (
                            <li key={didx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="resume-section">
                  <h3 className="section-title-main">Compétences</h3>
                  <div className="skills-summary">
                    {resumeData.key_skills.product_skills &&
                      resumeData.key_skills.product_skills.length > 0 && (
                        <p className="skills-line">
                          <strong>Gestion de projet:</strong>{" "}
                          {resumeData.key_skills.product_skills
                            .slice(0, 10)
                            .join(" - ")}
                        </p>
                      )}
                    {resumeData.key_skills.technical_skills &&
                      resumeData.key_skills.technical_skills.length > 0 && (
                        <p className="skills-line">
                          <strong>Compétences techniques:</strong>{" "}
                          {resumeData.key_skills.technical_skills
                            .slice(0, 15)
                            .join(" - ")}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeModal;
