import { useState } from "react";
import { scrapeJobUrl, generateResume } from "../services/apiService";
import WelcomeScreen from "./WelcomeScreen";
import FormWidget from "./FormWidget";
import LoadingScreen from "./LoadingScreen";
import CVAnalysisView from "./CVAnalysisView";

function CVFlowManager() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const totalSteps = 11;

  const handleWelcomeStart = () => {
    setCurrentStep(2);
  };

  const handleFormSubmit = async (values, navigation = "next") => {
    const updatedData = { ...formData, ...values };
    setFormData(updatedData);

    if (navigation === "previous") {
      if (currentStep === 6 && !updatedData.job_url) {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep - 1);
      }
      return;
    }

    if (currentStep === 4) {
      if (updatedData.job_url && updatedData.job_url.trim()) {
        setCurrentStep(5);
        setIsLoading(true);

        try {
          const scrapedData = await scrapeJobUrl(updatedData.job_url);
          setFormData({
            ...updatedData,
            job_description: scrapedData.job_description,
            main_missions: scrapedData.main_missions,
            qualifications: scrapedData.qualifications,
            additional_info: scrapedData.additional_info,
          });
          setIsLoading(false);
          setCurrentStep(6);
        } catch (error) {
          console.error("URL scraping failed:", error);
          setIsLoading(false);
          setCurrentStep(6);
        }
      } else {
        setCurrentStep(6);
      }
    } else if (currentStep === 9) {
      setCurrentStep(10);
      setIsLoading(true);

      try {
        const result = await generateResume(updatedData);
        setIsLoading(false);

        if (result.next_action === "RENDER_ANALYSIS") {
          setAnalysisData(result.widget_data);
          setCurrentStep(11);
        }
      } catch (error) {
        console.error("Resume generation failed:", error);
        setIsLoading(false);
        alert("Erreur lors de la génération du CV. Veuillez réessayer.");
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  if (currentStep === 1) {
    return (
      <WelcomeScreen
        title="Super, on va adapter mon CV à votre offre."
        subtitle="Je vous pose quelques questions, puis je génère un CV prêt à être envoyé."
        buttonText="Commencer"
        onStart={handleWelcomeStart}
      />
    );
  }

  if (currentStep === 5) {
    return (
      <LoadingScreen
        title="Je m'occupe de récupérer l'annonce..."
        subtitle="Promis, ça ne prend pas longtemps."
      />
    );
  }

  if (currentStep === 10) {
    return (
      <LoadingScreen
        title="Je génère un CV sur mesure..."
        subtitle="Donnez-moi 20 à 30 secondes."
      />
    );
  }

  if (currentStep === 11 && analysisData) {
    return <CVAnalysisView data={analysisData} />;
  }

  const getFormConfig = () => {
    switch (currentStep) {
      case 2:
        return {
          form_id: "cv_step2",
          title: "Commençons par l'offre.",
          description: "Dites-moi simplement l'entreprise et le poste visé.",
          current_step: 2,
          total_steps: totalSteps,
          fields: [
            {
              name: "company_name",
              label: "Nom de l'entreprise",
              type: "text",
              required: true,
              placeholder: "Exemple : Alan, Airbus, Back Market...",
              value: formData.company_name || "",
            },
            {
              name: "job_title",
              label: "Intitulé du poste",
              type: "text",
              required: true,
              placeholder: "Exemple : Product Owner",
              value: formData.job_title || "",
            },
          ],
        };

      case 3:
        return {
          form_id: "cv_step3",
          title: "Qui êtes-vous pour ce poste ?",
          description: "Juste pour que je sache à qui je parle 😊",
          current_step: 3,
          total_steps: totalSteps,
          fields: [
            {
              name: "recruiter_name",
              label: "Votre prénom",
              type: "text",
              required: true,
              placeholder: "Votre prénom (promis, il reste entre nous)",
              value: formData.recruiter_name || "",
            },
            {
              name: "recruiter_role",
              label: "Votre rôle",
              type: "radio",
              required: true,
              options: [
                { value: "recommend", label: "Je veux te recommander" },
                { value: "recruiter", label: "Je recrute pour ce poste" },
                { value: "other", label: "Autre" },
              ],
              value: formData.recruiter_role || "",
              allowOtherText: true,
            },
            {
              name: "recruiter_role_other",
              type: "hidden",
              value: formData.recruiter_role_other || "",
            },
          ],
        };

      case 4:
        return {
          form_id: "cv_step4",
          title: "Avez-vous un lien vers l'annonce ?",
          description:
            "Si vous l'avez, je récupère automatiquement les infos importantes.",
          current_step: 4,
          total_steps: totalSteps,
          fields: [
            {
              name: "job_url",
              label: "Lien de l'annonce",
              type: "url",
              required: false,
              placeholder: "https://...",
              value: formData.job_url || "",
              allowSkip: true,
              skipText: "Je n'ai pas de lien, je veux le remplir à la main",
            },
          ],
        };

      case 6:
        return {
          form_id: "cv_step6",
          title: "Décrivez l'offre en quelques lignes.",
          description: formData.job_url
            ? "✓ Informations extraites - vous pouvez les modifier"
            : "Contexte, entreprise, rôle...",
          current_step: 6,
          total_steps: totalSteps,
          fields: [
            {
              name: "job_description",
              label: "",
              type: "textarea",
              required: true,
              placeholder:
                "Entreprise qui développe..., le poste consiste à...",
              rows: 8,
              value: formData.job_description || "",
            },
          ],
        };

      case 7:
        return {
          form_id: "cv_step7",
          title: "Quelles sont les missions du poste ?",
          description: "Les responsabilités, le quotidien.",
          current_step: 7,
          total_steps: totalSteps,
          fields: [
            {
              name: "main_missions",
              label: "",
              type: "textarea",
              required: true,
              placeholder: "Pilotage produit..., coordination...",
              rows: 8,
              value: formData.main_missions || "",
            },
          ],
        };

      case 8:
        return {
          form_id: "cv_step8",
          title: "Quel profil l'entreprise recherche ?",
          description: "Expérience, compétences techniques, soft skills...",
          current_step: 8,
          total_steps: totalSteps,
          fields: [
            {
              name: "qualifications",
              label: "",
              type: "textarea",
              required: true,
              placeholder: "3 ans d'expérience..., maîtrise de...",
              rows: 8,
              value: formData.qualifications || "",
            },
          ],
        };

      case 9:
        return {
          form_id: "cv_step9",
          title: "Y a-t-il d'autres infos importantes ?",
          description: "Contrat, salaire, lieu, rythme...",
          current_step: 9,
          total_steps: totalSteps,
          fields: [
            {
              name: "additional_info",
              label: "",
              type: "textarea",
              required: false,
              placeholder: "CDI..., Paris..., hybride...",
              rows: 6,
              value: formData.additional_info || "",
            },
          ],
        };

      default:
        return null;
    }
  };

  const formConfig = getFormConfig();

  if (!formConfig) {
    return <div>Étape invalide</div>;
  }

  return (
    <FormWidget
      formData={formConfig}
      onSubmit={(values) =>
        handleFormSubmit(values, values.navigation || "next")
      }
    />
  );
}

export default CVFlowManager;
