import { useState, useEffect } from "react";

function FormWidget({ formData, onSubmit }) {
  const {
    form_id,
    title,
    description,
    fields,
    current_step,
    total_steps,
    scraping_status,
  } = formData;

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Update values when formData changes (to handle prefilled data)
  useEffect(() => {
    const initialValues = {};
    fields.forEach((field) => {
      if (field.value) {
        initialValues[field.name] = field.value;
      }
    });
    setValues(initialValues);
  }, [formData, fields]);

  const handleChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return fields.every((field) => {
      if (!field.required) return true;
      const value = values[field.name];
      if (!value || value.trim().length === 0) return false;

      // If field is radio with "other" option and "other" is selected, check other text
      if (field.type === "radio" && field.allowOtherText && value === "other") {
        const otherValue = values[field.name + "_other"];
        return otherValue && otherValue.trim().length > 0;
      }

      return true;
    });
  };

  const handleSubmit = (e, direction = "next") => {
    e.preventDefault();

    // Ensure all fields are included in the submission (even if empty)
    const allFieldValues = {};
    fields.forEach((field) => {
      allFieldValues[field.name] = values[field.name] || "";
    });

    // If going back, don't validate
    if (direction === "previous") {
      onSubmit({ ...allFieldValues, navigation: "previous" });
      return;
    }

    // Validate required fields for forward navigation
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !allFieldValues[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form data
    onSubmit({ ...allFieldValues, navigation: "next" });
  };

  return (
    <div className="cv-form-container">
      <div className="cv-intro">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {current_step && total_steps && (
          <div className="step-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(current_step / total_steps) * 100}%` }}
              />
            </div>
            <p className="step-text">
              Step {current_step} of {total_steps}
            </p>
          </div>
        )}
      </div>

      {scraping_status && (
        <div
          className={`scraping-status-banner ${scraping_status === "success" ? "success" : "error"}`}
        >
          {scraping_status === "success" ? (
            <span>✓ Job details successfully extracted from URL</span>
          ) : scraping_status.startsWith("error:") ? (
            <span>⚠ {scraping_status.replace("error: ", "")}</span>
          ) : null}
        </div>
      )}

      <form onSubmit={handleSubmit} className="cv-form">
        {fields.map((field) => {
          // Skip hidden fields in rendering
          if (field.type === "hidden") {
            return null;
          }

          return (
            <div key={field.name} className="form-group">
              {field.label && (
                <label htmlFor={field.name} className="form-label">
                  {field.label}
                  {field.required && <span className="required"> *</span>}
                </label>
              )}

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 10}
                  className={`form-input ${errors[field.name] ? "error" : ""}`}
                  style={{ minHeight: "200px", resize: "vertical" }}
                />
              ) : field.type === "radio" ? (
                <>
                  <div className="radio-group">
                    {field.options?.map((option) => (
                      <label key={option.value} className="radio-option">
                        <input
                          type="radio"
                          name={field.name}
                          value={option.value}
                          checked={values[field.name] === option.value}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="radio-input"
                        />
                        <span className="radio-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {field.allowOtherText && values[field.name] === "other" && (
                    <input
                      type="text"
                      placeholder="Précisez votre rôle..."
                      value={values[field.name + "_other"] || ""}
                      onChange={(e) =>
                        handleChange(field.name + "_other", e.target.value)
                      }
                      className="form-input"
                      style={{ marginTop: "12px" }}
                    />
                  )}
                </>
              ) : (
                <>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`form-input ${errors[field.name] ? "error" : ""}`}
                  />
                  {field.allowSkip && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleChange(field.name, "");
                        handleSubmit(e, "next");
                      }}
                      className="skip-button"
                    >
                      {field.skipText || "Passer cette étape"}
                    </button>
                  )}
                </>
              )}

              {errors[field.name] && (
                <span className="error-message">{errors[field.name]}</span>
              )}
            </div>
          );
        })}

        <div className="form-navigation">
          {current_step && current_step > 1 && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "previous")}
              className="cv-form-btn cv-form-back"
            >
              Précédent
            </button>
          )}
          <button
            type="submit"
            className={`cv-form-submit ${!isFormValid() ? "disabled" : ""}`}
            disabled={!isFormValid()}
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormWidget;
