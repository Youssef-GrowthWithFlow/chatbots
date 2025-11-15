import PropTypes from 'prop-types';

/**
 * ProjectItem - Single project entry
 */
function ProjectItem({ title, description, technologies, impact }) {
  return (
    <article className="project-item">
      <h3 className="project-title">{title}</h3>

      {description && (
        <p className="project-description">{description}</p>
      )}

      {technologies && technologies.length > 0 && (
        <p className="project-tech">
          {Array.isArray(technologies) ? technologies.join(' · ') : technologies}
        </p>
      )}

      {impact && (
        <p className="project-impact">{impact}</p>
      )}
    </article>
  );
}

ProjectItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  technologies: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  impact: PropTypes.string,
};

export default ProjectItem;
