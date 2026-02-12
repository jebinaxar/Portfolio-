export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateAndNormalizeContactPayload = (payload = {}) => {
  const { name, email, message, website } = payload;
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedMessage = String(message || "").trim();

  if (!normalizedName || !normalizedEmail || !normalizedMessage) {
    return {
      ok: false,
      statusCode: 400,
      message: "All fields are required",
    };
  }

  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      statusCode: 400,
      message: "Please provide a valid email",
    };
  }

  if (website) {
    return {
      ok: false,
      statusCode: 202,
      message: "Contact request submitted",
      honeypotTriggered: true,
    };
  }

  return {
    ok: true,
    payload: {
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
      status: "new",
      createdAt: new Date(),
    },
  };
};
