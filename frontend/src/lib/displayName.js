/**
 * Get display name for user greetings with fallback logic
 * @param {Object} user - User object with optional first_name, email, and role
 * @returns {string} Capitalized display name
 */
export function getDisplayName(user) {
  if (!user) return 'there';

  // 1st preference: first_name
  if (user.first_name) {
    return capitalize(user.first_name);
  }

  // 2nd preference: email prefix (part before @)
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return capitalize(emailPrefix);
  }

  // 3rd preference: role label
  if (user.role) {
    return capitalize(user.role);
  }

  // Final fallback
  return 'there';
}

/**
 * Capitalize first letter of a string
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
