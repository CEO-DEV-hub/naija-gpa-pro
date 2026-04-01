const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

const validateString = (input: string, maxLength: number): boolean => {
  if (input.length > maxLength) {
    return false;
  }
  // Add any other validation rules here, e.g. regex for allowed characters
  return true;
};

export { sanitizeInput, validateString };
