/**
 * Cor padrão para fallback quando a cor fornecida é inválida
 */
const DEFAULT_COLOR = "#CBD5E1";

/**
 * Normaliza uma cor hexadecimal, garantindo formato válido
 * @param color - Cor em formato hexadecimal (ex: "#FF5733" ou "ff5733")
 * @returns Cor normalizada em formato #RRGGBB ou cor padrão se inválida
 */
export function normalizeHexColor(
  color: string | null | undefined,
  fallback = DEFAULT_COLOR,
): string {
  // Handles undefined, null, or empty strings
  if (!color || typeof color !== "string") {
    return fallback;
  }

  const normalized = color.trim().toUpperCase();

  // Adiciona # se não tiver
  const withHash = normalized.startsWith("#") ? normalized : `#${normalized}`;

  // Valida formato hexadecimal
  if (/^#[0-9A-F]{6}$/.test(withHash)) {
    return withHash;
  }

  return fallback;
}

/**
 * Calcula a cor de texto ideal (preto ou branco) com base na cor de fundo
 * para garantir contraste legível.
 *
 * Usa o algoritmo de luminância relativa (weighted RGB) para determinar
 * se a cor de fundo é clara ou escura.
 *
 * @param backgroundColor - Cor de fundo em formato hexadecimal (#RRGGBB)
 * @returns "#111111" para fundos claros ou "#FFFFFF" para fundos escuros
 *
 * @example
 * ```ts
 * getContrastTextColor("#FFFFFF") // "#111111" (preto para fundo branco)
 * getContrastTextColor("#000000") // "#FFFFFF" (branco para fundo preto)
 * getContrastTextColor("#3B82F6") // "#FFFFFF" (branco para azul)
 * ```
 */
export function getContrastTextColor(
  backgroundColor: string | null | undefined,
): string {
  const normalized = normalizeHexColor(backgroundColor);
  const hex = normalized.replace("#", "");
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  // Cálculo de luminância relativa usando pesos padrão
  // Verde tem maior peso visual, seguido de vermelho e azul
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  // Threshold: cores com brightness >= 150 são consideradas claras
  return brightness >= 150 ? "#111111" : "#FFFFFF";
}

/**
 * Gera estilo de badge com cor de fundo customizada e texto contrastante
 * @param color - Cor em formato hexadecimal
 * @returns Objeto de estilo React com backgroundColor, color e borderColor
 */
export function getColoredBadgeStyle(color: string | null | undefined) {
  const backgroundColor = normalizeHexColor(color);
  const textColor = getContrastTextColor(backgroundColor);

  return {
    backgroundColor,
    color: textColor,
    borderColor:
      textColor === "#FFFFFF"
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(0, 0, 0, 0.2)",
  };
}

/**
 * Verifica se uma cor é considerada clara (brightness >= threshold)
 * @param color - Cor em formato hexadecimal
 * @param threshold - Valor de luminância (0-255, padrão: 150)
 * @returns true se a cor for clara, false se for escura
 */
export function isLightColor(
  color: string | null | undefined,
  threshold = 150,
): boolean {
  const normalized = normalizeHexColor(color);
  const hex = normalized.replace("#", "");
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness >= threshold;
}
