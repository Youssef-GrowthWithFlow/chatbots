import PropTypes from 'prop-types';
import BulletList from '../ui/BulletList';

/**
 * EducationItem - Single education entry
 */
function EducationItem({ degree, school, year, details }) {
  return (
    <article className="education-item">
      <div className="education-header">
        <div>
          <h3 className="education-degree">{degree}</h3>
          <p className="education-school">{school}</p>
        </div>
        <p className="education-year">{year}</p>
      </div>

      {details && details.length > 0 && (
        <BulletList items={details} className="education-details" />
      )}
    </article>
  );
}

EducationItem.propTypes = {
  degree: PropTypes.string.isRequired,
  school: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(PropTypes.string),
};

export default EducationItem;
