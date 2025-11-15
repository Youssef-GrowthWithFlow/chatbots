import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import "./ResumeModal.css";
import ResumeSidebar from "./ResumeSidebar";
import ResumeMainContent from "./ResumeMainContent";
import { generatePDFFilename, getPDFConfig, validateResumeData, safeArray, safeObject } from "./utils/resumeHelpers";

const API_BASE_URL = "http://localhost:8000";

// DEBUG: Dummy resume data (matches StructuredResume Pydantic model)
const DUMMY_RESUME = {
  contact_info: {
    name: "Youssef Benkirane",
    job_title: "Product Owner",
    city: "Toulouse, France",
    phone: "(+33) 7 63 99 17 47",
    email: "youssef@growthwithflow.com",
  },
  professional_summary:
    "Product Owner avec un background technique, spécialisé dans l'accompagnement de solopreneurs et PME pour la création de produits digitaux efficaces et automatisés. Compétent en développement web, gestion de produit et intégration d'outils no-code/low-code pour accélérer la mise sur le marché et optimiser les processus.",

  professional_experience: [
    {
      job_title: "Freelance Consultant IT",
      company: "Growth With Flow",
      location: "Toulouse (Remote)",
      duration: "Jan. 2024 – Présent",
      achievements: [
        "Accompagnement de solopreneurs et petites équipes dans la définition de leur offre digitale (sites, CRM, automatisations, IA).",
        "Mise en place de CRM, tunnels de vente et automatisations (n8n, Make, Notion, Zapier) pour réduire le temps passé sur les tâches répétitives.",
        "Co-construction de produits SaaS B2B (ex : Styly, visualisation de revêtements de sol) : cadrage, priorisation, roadmap et développement MVP."
      ]
    },
    {
      job_title: "Développeur Fullstack",
      company: "Sipios (mission pour Bpifrance)",
      location: "Paris / Remote",
      duration: "Fév. 2023 – Août 2023",
      achievements: [
        "Participation au développement d'une application fintech pour Bpifrance dans un contexte agile (équipe produit / tech / design).",
        "Travail en binôme avec les Product Owners pour affiner les besoins, challenger les solutions et sécuriser la livraison.",
        "Contribution à la qualité du code (revues, tests, documentation) et à l'amélioration continue des pratiques de l'équipe."
      ]
    }
  ],

  education: [
    {
      degree: "Diplôme d'ingénieur en Informatique (spécialisation SIGL)",
      school: "EPITA – École d'ingénieurs en informatique",
      year: "Diplômé",
      details: [
        "Projets orientés produit, SaaS, cloud et gestion de projet.",
        "Echange universitaire à l'Université de Stellenbosch (Afrique du Sud)."
      ]
    }
  ],

  key_skills: {
    product_skills: [
      "Cadrage produit & vision",
      "Discovery (entretiens, ateliers, user research light)",
      "Roadmap & priorisation (value vs effort)",
      "Définition de KPIs & suivi",
      "Pilotage de backlog (user stories, critères d'acceptation)"
    ],
    tools: [
      "Notion (CRM, dashboards, bases de connaissances)",
      "n8n & Make (automatisations & intégrations)",
      "Framer & Figma (maquettes & sites web)",
      "Git / GitHub",
      "AWS (Lambda, S3 – pour backends légers)"
    ],
    technical_skills: [
      "JavaScript / TypeScript",
      "React",
      "Python (FastAPI)",
      "APIs REST",
      "Automatisations no-code / low-code",
      "Intégration d'API d'IA (OpenAI, Gemini)"
    ]
  },

  projects: [
    {
      title: "Styly – Outil de visualisation pour distributeurs de revêtements de sol",
      description:
        "Co-pilotage produit et technique d'un outil de visualisation pour aider des distributeurs de sols à présenter leurs produits dans des intérieurs réalistes.",
      impact:
        "5 clients payants en phase de lancement, avec des retours positifs sur l'amélioration de l'expérience client et la réduction du temps de décision d'achat."
    } 
  ],

  languages: [
    { language: "Français", proficiency: "Langue maternelle" },
    { language: "Anglais", proficiency: "Maîtrise professionnelle (C1)" }
  ],

  match_analysis: {
    score: 90,
    tag: "On est faits pour travailler ensemble",
    intro_message:
      "Votre offre correspond à mon positionnement : un profil hybride produit / tech capable de clarifier les besoins, structurer une roadmap et livrer rapidement des solutions concrètes.",
    key_strengths: [
      "Expérience hybride Product Owner / développeur sur des projets web et SaaS.",
      "Habitude de travailler avec des solopreneurs, PME et équipes produit pour transformer des idées en produits concrets."
    ],
    points_of_attention: [
      "Je privilégie les contextes à taille humaine où la collaboration et l'itération rapide sont possibles."
    ]
  }
};

function ResumeModal({ resumeId, onClose }) {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resumeRef = useRef(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      // DEBUG: Use dummy data for debug-dummy resumeId
      if (resumeId === "debug-dummy") {
        setResumeData(DUMMY_RESUME);
        setLoading(false);
        return;
      }

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

  const handleDownloadPDF = () => {
    if (!resumeRef.current || !resumeData) return;

    const element = resumeRef.current;
    const filename = generatePDFFilename(
      resumeData.contact_info.name,
      resumeData.contact_info.job_title
    );
    const config = getPDFConfig(filename);

    // @ts-ignore - html2pdf loaded from CDN
    window.html2pdf().set(config).from(element).save();
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
          <div className="loading">Génération du CV…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-modal-overlay" onClick={handleOverlayClick}>
        <div className="resume-modal-content">
          <div className="error-message">
            <p>Erreur : {error}</p>
            <button onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData || !validateResumeData(resumeData)) return null;

  // Destructure with safe defaults
  const {
    contact_info,
    professional_summary,
    professional_experience = [],
    projects = [],
    education = [],
    key_skills = {},
    languages = []
  } = resumeData;

  return (
    <div className="resume-modal-overlay" onClick={handleOverlayClick}>
      <div className="resume-modal-content">
        {/* Header */}
        <div className="resume-modal-header">
          <h2>CV généré</h2>
          <div className="resume-modal-actions">
            <button className="btn-download" onClick={handleDownloadPDF}>
              Télécharger PDF
            </button>
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="resume-modal-body">
          <div className="resume-preview" ref={resumeRef}>
            <div className="resume-page">
              <div className="resume-layout">
                {/* Sidebar (Left 35%) */}
                <ResumeSidebar
                  contactInfo={contact_info}
                  professionalSummary={professional_summary}
                  tools={safeArray(key_skills.tools)}
                  languages={safeArray(languages)}
                />

                {/* Main Content (Right 65%) */}
                <ResumeMainContent
                  experiences={safeArray(professional_experience)}
                  projects={safeArray(projects)}
                  education={safeArray(education)}
                  skills={safeObject(key_skills)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ResumeModal.propTypes = {
  resumeId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ResumeModal;
