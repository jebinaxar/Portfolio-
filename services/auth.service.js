export const validateAuthCredentialsInput = (email, password) => {
  return Boolean(email && password);
};

export const getNextSessionVersion = (currentSessionVersion) => {
  return (currentSessionVersion || 1) + 1;
};
