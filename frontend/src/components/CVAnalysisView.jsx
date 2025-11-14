import { useState } from "react";
import ResumeModal from "./ResumeModal";

function CVAnalysisView({ data }) {
  const {
    company_name,
    job_title,
    match_score,
    match_tag,
    intro_message,
    key_strengths,
    points_of_attention,
    resume_id,
  } = data;

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="cv-analysis-container">
      <div className="cv-analysis-header">
        <h2 className="cv-analysis-title">
          Voici où je me situe pour ce poste.
        </h2>
        <p className="cv-analysis-subtitle">
          Je vous résume si je suis un bon match... et ce qui est à ajuster si
          besoin.
        </p>
      </div>

      {/* Personalized Tag */}
      <div className="match-tag-container">
        <span className="match-tag">
          {match_tag || "Un profil très solide pour ce poste"}
        </span>
        <span className="match-score-badge">{match_score}%</span>
      </div>

      {/* Introduction Message */}
      {intro_message && <p className="match-intro-message">{intro_message}</p>}

      {/* Key Strengths */}
      {key_strengths && key_strengths.length > 0 && (
        <div className="analysis-section">
          <h3 className="section-title">Ce qui fonctionne bien</h3>
          <ul className="analysis-list strengths-list">
            {key_strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Points of Attention */}
      {points_of_attention && points_of_attention.length > 0 && (
        <div className="analysis-section">
          <h3 className="section-title">Points de vigilance</h3>
          <ul className="analysis-list attention-list">
            {points_of_attention.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* View Resume Button */}
      <div className="cv-actions">
        <button
          onClick={() => setShowModal(true)}
          className="cv-action-btn primary"
        >
          Voir le CV généré
        </button>
      </div>

      {/* Resume Modal */}
      {showModal && (
        <ResumeModal resumeId={resume_id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default CVAnalysisView;
