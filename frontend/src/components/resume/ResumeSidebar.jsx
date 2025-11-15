import PropTypes from 'prop-types';
import SidebarTitle from './ui/SidebarTitle';

/**
 * ResumeSidebar - Left column (35%) with contact, profile, tools, languages
 */
function ResumeSidebar({ contactInfo, professionalSummary, tools, languages }) {
  return (
    <aside className="resume-sidebar">
      {/* Header with Name and Job Title */}
      <div className="resume-header">
        <h1 className="resume-name">{contactInfo.name}</h1>
        <p className="resume-job-title">{contactInfo.job_title}</p>
      </div>

      {/* Contact Information */}
      <section className="sidebar-section">
        <SidebarTitle>Contact</SidebarTitle>
        <ul className="contact-list">
          <li className="contact-item">{contactInfo.city}</li>
          <li className="contact-item">{contactInfo.phone}</li>
          <li className="contact-item">{contactInfo.email}</li>
        </ul>
      </section>

      {/* Professional Summary */}
      {professionalSummary && (
        <section className="sidebar-section">
          <SidebarTitle>Profil</SidebarTitle>
          <p className="sidebar-text">{professionalSummary}</p>
        </section>
      )}

      {/* Tools */}
      {tools && tools.length > 0 && (
        <section className="sidebar-section">
          <SidebarTitle>Outils</SidebarTitle>
          <ul className="tools-list">
            {tools.map((tool, idx) => (
              <li key={idx} className="tool-item">{tool}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section className="sidebar-section">
          <SidebarTitle>Langues</SidebarTitle>
          <div className="languages-list">
            {languages.map((lang, idx) => (
              <div key={idx} className="language-item">
                <span className="language-name">{lang.language}</span>
                <span className="language-level"> · {lang.proficiency}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

ResumeSidebar.propTypes = {
  contactInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    job_title: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  professionalSummary: PropTypes.string,
  tools: PropTypes.arrayOf(PropTypes.string),
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string.isRequired,
      proficiency: PropTypes.string.isRequired,
    })
  ),
};

export default ResumeSidebar;
