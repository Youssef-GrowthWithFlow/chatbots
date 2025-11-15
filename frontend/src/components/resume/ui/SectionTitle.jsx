import PropTypes from 'prop-types';

/**
 * SectionTitle - Reusable section title with accent underline
 * Used for both sidebar and main content sections
 */
function SectionTitle({ children }) {
  return (
    <h2 className="section-title">
      {children}
    </h2>
  );
}

SectionTitle.propTypes = {
  children: PropTypes.string.isRequired,
};

export default SectionTitle;
