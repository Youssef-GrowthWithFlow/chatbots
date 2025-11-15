import PropTypes from 'prop-types';
import SectionTitle from './ui/SectionTitle';
import ExperienceItem from './sections/ExperienceItem';
import ProjectItem from './sections/ProjectItem';
import EducationItem from './sections/EducationItem';
import BulletList from './ui/BulletList';

/**
 * ResumeMainContent - Right column (65%) with experiences, projects, education, skills
 */
function ResumeMainContent({ experiences, projects, education, skills }) {
  return (
    <main className="resume-main">
      {/* Professional Experience */}
      {experiences && experiences.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Expériences Professionnelles</SectionTitle>
          {experiences.map((exp, idx) => (
            <ExperienceItem
              key={idx}
              jobTitle={exp.job_title}
              company={exp.company}
              location={exp.location}
              duration={exp.duration}
              achievements={exp.achievements}
            />
          ))}
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Projets Clés</SectionTitle>
          {projects.map((project, idx) => (
            <ProjectItem
              key={idx}
              title={project.title}
              description={project.description}
              technologies={project.technologies}
              impact={project.impact}
            />
          ))}
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Formation</SectionTitle>
          {education.map((edu, idx) => (
            <EducationItem
              key={idx}
              degree={edu.degree}
              school={edu.school}
              year={edu.year}
              details={edu.details}
            />
          ))}
        </section>
      )}

      {/* Skills */}
      {skills && (skills.product_skills || skills.technical_skills) && (
        <section className="resume-section">
          <SectionTitle>Compétences</SectionTitle>
          <div className="skills-grid">
            {skills.product_skills && skills.product_skills.length > 0 && (
              <div className="skill-category">
                <h3 className="skill-category-title">Produit / Gestion</h3>
                <BulletList items={skills.product_skills} className="skill-list" />
              </div>
            )}

            {skills.technical_skills && skills.technical_skills.length > 0 && (
              <div className="skill-category">
                <h3 className="skill-category-title">Techniques</h3>
                <BulletList items={skills.technical_skills} className="skill-list" />
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

ResumeMainContent.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      job_title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired,
      achievements: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      technologies: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
      ]),
      impact: PropTypes.string,
    })
  ),
  education: PropTypes.arrayOf(
    PropTypes.shape({
      degree: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
      details: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  skills: PropTypes.shape({
    product_skills: PropTypes.arrayOf(PropTypes.string),
    technical_skills: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default ResumeMainContent;
