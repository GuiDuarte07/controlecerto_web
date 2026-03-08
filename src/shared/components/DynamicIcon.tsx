import * as LucideIcons from "lucide-react";

/**
 * Mapa principal de ícones do Lucide disponíveis no sistema
 * Use esses nomes ao salvar novos ícones no banco de dados
 */
const ICON_MAP = {
  // Natureza e Animais
  leaf: LucideIcons.Leaf,
  sprout: LucideIcons.Sprout,
  pawPrint: LucideIcons.PawPrint,
  dog: LucideIcons.Dog,
  trees: LucideIcons.Trees,
  treePine: LucideIcons.TreePine,

  // Alimentação
  utensils: LucideIcons.Utensils,
  utensilsCrossed: LucideIcons.UtensilsCrossed,
  cookie: LucideIcons.Cookie,
  shoppingCart: LucideIcons.ShoppingCart,

  // Educação e Leitura
  bookOpen: LucideIcons.BookOpen,
  book: LucideIcons.Book,

  // Interface e Sistema
  moon: LucideIcons.Moon,
  sun: LucideIcons.Sun,
  wifi: LucideIcons.Wifi,
  moreHorizontal: LucideIcons.MoreHorizontal,

  // Entretenimento
  gamepad2: LucideIcons.Gamepad2,
  trophy: LucideIcons.Trophy,

  // Presentes e Celebração
  gift: LucideIcons.Gift,
  sparkles: LucideIcons.Sparkles,

  // Pessoas
  smile: LucideIcons.Smile,
  user: LucideIcons.User,
  users: LucideIcons.Users,

  // Saúde
  syringe: LucideIcons.Syringe,
  heart: LucideIcons.Heart,
  skull: LucideIcons.Skull,

  // Viagem e Transporte
  plane: LucideIcons.Plane,
  luggage: LucideIcons.Luggage,
  taxi: LucideIcons.Car,
  car: LucideIcons.Car,
  waves: LucideIcons.Waves,

  // Finanças
  trendingUp: LucideIcons.TrendingUp,
  creditCard: LucideIcons.CreditCard,
  banknote: LucideIcons.Banknote,
  dollarSign: LucideIcons.DollarSign,

  // Jurídico
  gavel: LucideIcons.Gavel,
  scale: LucideIcons.Scale,

  // Casa e Moradia
  home: LucideIcons.Home,
  building: LucideIcons.Building,

  // Compras e Comércio
  store: LucideIcons.Store,
  shoppingBag: LucideIcons.ShoppingBag,
  storefront: LucideIcons.Store,

  // Tecnologia
  laptop: LucideIcons.Laptop,
  smartphone: LucideIcons.Smartphone,
  tower: LucideIcons.Radio,

  // Vestuário
  shirt: LucideIcons.Shirt,

  // Trabalho
  briefcase: LucideIcons.Briefcase,
  briefcaseBusiness: LucideIcons.BriefcaseBusiness,

  // Ferramentas
  wrench: LucideIcons.Wrench,
  hammer: LucideIcons.Hammer,
  settings: LucideIcons.Settings,

  // Jóias e Luxo
  diamond: LucideIcons.Diamond,
  gem: LucideIcons.Gem,
} as const;

/**
 * Mapa de migração: converte nomes antigos do Material UI para nomes do Lucide
 * Permite retrocompatibilidade com ícones salvos no formato antigo
 */
const MATERIAL_TO_LUCIDE_MAP: Record<string, keyof typeof ICON_MAP> = {
  // Material UI → Lucide
  eco: "leaf",
  pets: "pawPrint",
  restaurant: "utensilsCrossed",
  import_contacts: "bookOpen",
  dark_mode: "moon",
  wifi: "wifi",
  videogame_asset: "gamepad2",
  redeem: "gift",
  forest: "trees",
  face: "smile",
  syringe: "syringe",
  travel: "plane",
  shopping_cart: "shoppingCart",
  gavel: "gavel",
  home: "home",
  payments: "creditCard",
  local_taxi: "taxi",
  beach_access: "waves",
  trending_up: "trendingUp",
  deceased: "skull",
  tsunami: "waves",
  featured_seasonal_and_gifts: "gift",
  storefront: "store",
  cookie: "cookie",
  trophy: "trophy",
  laptop_chromebook: "laptop",
  diamond: "diamond",
  more_horiz: "moreHorizontal",
  cell_tower: "tower",
  checkroom: "shirt",
  work: "briefcase",
  build: "wrench",
};

export type IconName = keyof typeof ICON_MAP;
export type LegacyIconName = keyof typeof MATERIAL_TO_LUCIDE_MAP;
export type SupportedIconName = IconName | LegacyIconName;

interface DynamicIconProps extends Omit<React.ComponentProps<"svg">, "name"> {
  /**
   * Nome do ícone (suporta nomes novos do Lucide e antigos do Material UI)
   */
  name: SupportedIconName;
  /**
   * Tamanho opcional do ícone (aplica tanto width quanto height)
   */
  size?: number;
}

/**
 * Componente de ícone dinâmico que renderiza ícones do Lucide
 * com base em uma string (nome do ícone salvo no banco de dados).
 *
 * Suporta retrocompatibilidade com ícones do Material UI salvos anteriormente.
 *
 * @example
 * ```tsx
 * // Usando nome novo do Lucide
 * <DynamicIcon name="leaf" className="h-5 w-5" />
 *
 * // Usando nome antigo do Material UI (será convertido automaticamente)
 * <DynamicIcon name="eco" className="h-5 w-5" />
 *
 * // Com tamanho customizado
 * <DynamicIcon name="home" size={24} />
 * ```
 */
export function DynamicIcon({ name, size, className, ...props }: DynamicIconProps) {
  // Tenta converter nome antigo do Material UI para Lucide
  const iconName = (MATERIAL_TO_LUCIDE_MAP[name as LegacyIconName] ?? name) as IconName;

  // Busca o componente do ícone
  const IconComponent = ICON_MAP[iconName];

  // Fallback: se o ícone não existir, não renderiza nada
  if (!IconComponent) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[DynamicIcon] Ícone não encontrado: "${name}"`);
    }
    return null;
  }

  return (
    <IconComponent
      className={className}
      width={size}
      height={size}
      {...props}
    />
  );
}

/**
 * Metadados de cada ícone com palavras-chave para busca (pt + en)
 */
export const ICON_META: Record<IconName, { keywords: string[] }> = {
  leaf: { keywords: ["folha", "leaf", "natureza", "nature", "eco", "planta", "plant", "verde", "green"] },
  sprout: { keywords: ["broto", "sprout", "planta", "plant", "crescimento", "growth", "natureza", "nature"] },
  pawPrint: { keywords: ["pata", "paw", "pet", "animal", "cachorro", "dog", "gato", "cat"] },
  dog: { keywords: ["cachorro", "dog", "pet", "animal", "cão"] },
  trees: { keywords: ["árvores", "trees", "floresta", "forest", "natureza", "nature", "mata"] },
  treePine: { keywords: ["pinheiro", "pine", "árvore", "tree", "natureza", "nature", "natal", "christmas"] },
  utensils: { keywords: ["talheres", "utensils", "comida", "food", "restaurante", "restaurant", "cozinha", "kitchen", "garfo", "fork"] },
  utensilsCrossed: { keywords: ["talheres", "utensils", "comida", "food", "restaurante", "restaurant", "refeição", "meal"] },
  cookie: { keywords: ["biscoito", "cookie", "bolacha", "doce", "sweet", "confeitaria", "bakery"] },
  shoppingCart: { keywords: ["carrinho", "cart", "compras", "shopping", "mercado", "market", "supermercado"] },
  bookOpen: { keywords: ["livro", "book", "educação", "education", "leitura", "reading", "estudo", "study", "ensino"] },
  book: { keywords: ["livro", "book", "educação", "education", "leitura", "reading"] },
  moon: { keywords: ["lua", "moon", "noite", "night", "escuro", "dark", "tema", "theme"] },
  sun: { keywords: ["sol", "sun", "dia", "day", "claro", "light", "verão", "summer"] },
  wifi: { keywords: ["wifi", "internet", "rede", "network", "conexão", "connection", "sem fio"] },
  moreHorizontal: { keywords: ["mais", "more", "opções", "options", "menu", "extra"] },
  gamepad2: { keywords: ["vídeo game", "videogame", "jogo", "game", "controle", "gamepad", "entretenimento", "entertainment"] },
  trophy: { keywords: ["troféu", "trophy", "conquista", "achievement", "prêmio", "award", "vitória", "victory"] },
  gift: { keywords: ["presente", "gift", "presentes", "gifts", "aniversário", "birthday", "natal", "christmas", "celebração"] },
  sparkles: { keywords: ["brilho", "sparkles", "estrelas", "stars", "especial", "special", "magia", "magic"] },
  smile: { keywords: ["sorriso", "smile", "feliz", "happy", "rosto", "face", "pessoa", "person", "lazer"] },
  user: { keywords: ["usuário", "user", "pessoa", "person", "perfil", "profile", "conta", "account"] },
  users: { keywords: ["usuários", "users", "pessoas", "people", "grupo", "group", "família", "family", "social"] },
  syringe: { keywords: ["seringa", "syringe", "saúde", "health", "médico", "medical", "vacina", "vaccine", "farmácia"] },
  heart: { keywords: ["coração", "heart", "amor", "love", "saúde", "health", "carinho"] },
  skull: { keywords: ["caveira", "skull", "morte", "death", "halloween", "risco"] },
  plane: { keywords: ["avião", "plane", "viagem", "travel", "voo", "flight", "turismo", "tourism"] },
  luggage: { keywords: ["mala", "luggage", "viagem", "travel", "bagagem", "baggage", "turismo"] },
  taxi: { keywords: ["táxi", "taxi", "carro", "car", "transporte", "transport", "corrida", "ride"] },
  car: { keywords: ["carro", "car", "veículo", "vehicle", "transporte", "transport", "automóvel", "combustível", "fuel"] },
  waves: { keywords: ["ondas", "waves", "praia", "beach", "mar", "sea", "água", "water", "verão", "summer"] },
  trendingUp: { keywords: ["tendência", "trending", "crescimento", "growth", "investimento", "investment", "alta", "up", "lucro", "profit"] },
  creditCard: { keywords: ["cartão", "card", "crédito", "credit", "pagamento", "payment", "débito", "debit", "banco"] },
  banknote: { keywords: ["nota", "banknote", "dinheiro", "money", "cédula", "bill", "grana", "reais"] },
  dollarSign: { keywords: ["dólar", "dollar", "dinheiro", "money", "cifrão", "currency", "renda", "income"] },
  gavel: { keywords: ["martelo", "gavel", "jurídico", "legal", "justiça", "justice", "lei", "law", "multa"] },
  scale: { keywords: ["balança", "scale", "jurídico", "legal", "justiça", "justice", "equilíbrio"] },
  home: { keywords: ["casa", "home", "moradia", "housing", "lar", "house", "aluguel", "rent"] },
  building: { keywords: ["prédio", "building", "escritório", "office", "empresa", "company", "condomínio"] },
  store: { keywords: ["loja", "store", "comércio", "commerce", "mercado", "market", "varejo"] },
  shoppingBag: { keywords: ["sacola", "shopping bag", "compras", "shopping", "moda", "fashion", "roupa", "clothing"] },
  storefront: { keywords: ["loja", "store", "comércio", "commerce", "vitrine", "storefront", "varejo"] },
  laptop: { keywords: ["laptop", "computador", "computer", "tecnologia", "tech", "trabalho", "work", "notebook"] },
  smartphone: { keywords: ["celular", "smartphone", "phone", "mobile", "tecnologia", "tech", "telefone"] },
  tower: { keywords: ["torre", "tower", "antena", "antenna", "sinal", "signal", "celular", "cell", "comunicação"] },
  shirt: { keywords: ["camisa", "shirt", "roupa", "clothing", "vestuário", "fashion", "moda", "roupas"] },
  briefcase: { keywords: ["maleta", "briefcase", "trabalho", "work", "negócios", "business", "emprego", "job", "carreira"] },
  briefcaseBusiness: { keywords: ["maleta", "briefcase", "negócios", "business", "empresa", "company", "corporativo"] },
  wrench: { keywords: ["chave", "wrench", "ferramenta", "tool", "conserto", "repair", "manutenção", "maintenance"] },
  hammer: { keywords: ["martelo", "hammer", "ferramenta", "tool", "construção", "construction", "reforma"] },
  settings: { keywords: ["configurações", "settings", "engrenagem", "gear", "ajustes", "adjustments", "preferências"] },
  diamond: { keywords: ["diamante", "diamond", "joia", "jewel", "luxo", "luxury", "valor", "value", "precioso"] },
  gem: { keywords: ["gema", "gem", "joia", "jewel", "pedra", "stone", "luxo", "luxury", "precioso"] },
};

/**
 * Lista de todos os ícones disponíveis (útil para UI de seleção de ícones)
 */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP) as IconName[];

/**
 * Verifica se um nome de ícone é válido (novo ou legado)
 */
export function isValidIconName(name: string): name is SupportedIconName {
  return name in ICON_MAP || name in MATERIAL_TO_LUCIDE_MAP;
}

/**
 * Converte um nome de ícone legado (Material UI) para o nome atual (Lucide)
 * Útil para exibir ao usuário qual é o nome atual do ícone
 */
export function getLucideIconName(name: SupportedIconName): IconName {
  return (MATERIAL_TO_LUCIDE_MAP[name as LegacyIconName] ?? name) as IconName;
}
