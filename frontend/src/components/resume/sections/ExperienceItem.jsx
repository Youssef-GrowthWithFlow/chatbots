import PropTypes from 'prop-types';
import BulletList from '../ui/BulletList';

/**
 * ExperienceItem - Single professional experience entry
 */
function ExperienceItem({ jobTitle, company, location, duration, achievements }) {
  return (
    <article className="experience-item">
      <div className="experience-header">
        <div>
          <h3 className="experience-title">{jobTitle}</h3>
          <p className="experience-company">{company}</p>
        </div>
        <p className="experience-meta">{duration} · {location}</p>
      </div>

      {achievements && achievements.length > 0 && (
        <BulletList items={achievements} className="achievements-list" />
      )}
    </article>
  );
}

ExperienceItem.propTypes = {
  jobTitle: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  achievements: PropTypes.arrayOf(PropTypes.string),
};

export default ExperienceItem;
