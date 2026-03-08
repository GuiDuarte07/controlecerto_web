export const authValidations = {
  email: {
    isValid: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    minLength: 4,
    maxLength: 60,
  },
  password: {
    minLength: 4,
    maxLength: 30,
  },
  name: {
    minLength: 5,
    maxLength: 100,
  },
};

export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email) {
    return { valid: false, error: "Email é obrigatório" };
  }
  if (email.length < authValidations.email.minLength) {
    return { valid: false, error: "Email é muito curto" };
  }
  if (email.length > authValidations.email.maxLength) {
    return { valid: false, error: "Email é muito longo" };
  }
  if (!authValidations.email.isValid(email)) {
    return { valid: false, error: "Email inválido" };
  }
  return { valid: true };
}

export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password) {
    return { valid: false, error: "Senha é obrigatória" };
  }
  if (password.length < authValidations.password.minLength) {
    return {
      valid: false,
      error: `Senha deve ter no mínimo ${authValidations.password.minLength} caracteres`,
    };
  }
  if (password.length > authValidations.password.maxLength) {
    return {
      valid: false,
      error: `Senha deve ter no máximo ${authValidations.password.maxLength} caracteres`,
    };
  }
  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: "Nome é obrigatório" };
  }
  if (name.length < authValidations.name.minLength) {
    return {
      valid: false,
      error: `Nome deve ter no mínimo ${authValidations.name.minLength} caracteres`,
    };
  }
  if (name.length > authValidations.name.maxLength) {
    return {
      valid: false,
      error: `Nome deve ter no máximo ${authValidations.name.maxLength} caracteres`,
    };
  }
  return { valid: true };
}
