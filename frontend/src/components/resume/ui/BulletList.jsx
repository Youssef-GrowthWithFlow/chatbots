import PropTypes from 'prop-types';

/**
 * BulletList - Reusable list component with colored bullet points
 * Used for achievements, education details, skills, etc.
 */
function BulletList({ items, className = "achievements-list" }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={className}>
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

BulletList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default BulletList;
