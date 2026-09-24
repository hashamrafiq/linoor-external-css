export const contactLimits = { username: 120, email: 254, phone: 40, subject: 200, message: 10000 };

export function validateContact(input) {
  const values = {};
  const errors = {};
  for (const [field, limit] of Object.entries(contactLimits)) {
    const raw = input && typeof input[field] === "string" ? input[field] : "";
    const value = raw.trim();
    values[field] = value;
    if (!value) errors[field] = "Required";
    else if (value.length > limit) errors[field] = `Please use ${limit} characters or fewer.`;
    else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field !== "message" && /[\r\n]/.test(value))) errors[field] = "Please enter a valid value.";
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!errors.phone && (!/^[+\d\s().-]+$/.test(values.phone) || values.phone.replace(/\D/g, "").length < 7 || values.phone.replace(/\D/g, "").length > 15)) errors.phone = "Please enter a valid phone number.";
  return { values, errors };
}
