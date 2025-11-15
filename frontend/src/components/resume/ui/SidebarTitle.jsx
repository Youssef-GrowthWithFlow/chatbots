import PropTypes from 'prop-types';

/**
 * SidebarTitle - Title for sidebar sections
 * Smaller, more subtle than main section titles
 */
function SidebarTitle({ children }) {
  return (
    <h3 className="sidebar-title">
      {children}
    </h3>
  );
}

SidebarTitle.propTypes = {
  children: PropTypes.string.isRequired,
};

export default SidebarTitle;
