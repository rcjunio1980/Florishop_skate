export interface Product {
  id: string;
  name: string;
  category: 'Decks' | 'Trucks' | 'Wheels' | 'Apparel' | 'Acessórios' | 'Hardware' | 'Tênis' | 'Lifestyle';
  brand: 'Florishop' | 'Independent' | 'Thunder' | 'Venture' | 'Spitfire' | 'Vans' | 'Nike SB' | 'Adidas' | 'DC Shoes' | 'Outras';
  sku: string;
  purchasePrice: number; // Preço de Custo em R$
  profitMargin: number;  // Margem de Lucro em %
  salePrice: number;     // Preço de Venda em R$
  stockQuantity: number; // Quantidade em Estoque
  images: string[];
  specs: string[];
  description: string;
  featured?: boolean;
  badge?: string;
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  selectedSize?: string;
  quantity: number;
  isGift?: boolean;
  customNote?: string;
}

export type PaymentMethod = 'pix' | 'maquininha' | 'deposito';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  cpf?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  status: 'active' | 'blocked';
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
}

export interface OrderStatusHistoryItem {
  id: string;
  fromStatus?: Order['status'] | string;
  status: Order['status'];
  timestamp: string; // ISO format
  formattedDate: string; // Data legível pt-BR
  updatedBy: 'admin' | 'customer' | 'system';
  authorName: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  interest?: number;
  shippingCost?: number;
  shippingMethod?: string;
  shippingAddress?: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
  };
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    pixKey?: string;
    cardInstallments?: string;
    cardInterestRate?: number;
    receiptAttached?: boolean;
    receiptName?: string;
    statusHistory?: OrderStatusHistoryItem[];
  };
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'Aguardando Pagamento' | 'Pago / Aprovado' | 'Em Separação' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Aguardando Comprovante / Validação';
  adminNotes?: string;
  trackingCode?: string;
  statusHistory?: OrderStatusHistoryItem[];
  deliveredAt?: string;
  canceledAt?: string;
  hiddenFromActiveView?: boolean; // Ocultado da visualização operacional de pedidos ativos
  isDiscardedAttempt?: boolean; // Registrado como tentativa / pedido não concluído no banco
  discardedAt?: string; // Data e hora do descarte
  discardReason?: string; // Motivo do descarte operacional
}

export interface UserPurchaseHistoryRecord {
  id: string;
  userId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  completedAt: string;
  orderDate: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod?: string;
  paymentMethod: PaymentMethod;
  itemsCount: number;
  items: CartItem[];
  trackingCode?: string;
  deliveryNotes?: string;
  status: 'Entregue';
  createdAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'ENTRADA' | 'SAÍDA_VENDA' | 'AJUSTE';
  quantity: number;
  date: string;
  notes: string;
}

export interface FeaturedSlotConfig {
  productId: string;
  customTag?: string;
  customSubtitle?: string;
}

export interface FeaturedMonthConfig {
  slot1: FeaturedSlotConfig; // Destaque Principal (Card Grande Esquerda)
  slot2: FeaturedSlotConfig; // Destaque Secundário Superior (Card Direito Top)
  slot3: FeaturedSlotConfig; // Destaque Secundário Inferior (Card Direito Bottom)
}

export const INITIAL_FEATURED_CONFIG: FeaturedMonthConfig = {
  slot1: {
    productId: 'prod-2',
    customTag: 'NOVO DROP',
    customSubtitle: 'SHAPE MAPLE CANADENSE',
  },
  slot2: {
    productId: 'prod-3',
    customTag: 'TITANIUM',
    customSubtitle: 'TRUCKS DE ALTA DENSIDADE',
  },
  slot3: {
    productId: 'prod-4',
    customTag: '101A DUREZA',
    customSubtitle: 'URETANO HIGH POP',
  },
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pro Series - Caveira Urban',
    category: 'Decks',
    brand: 'Florishop',
    sku: 'D-CAVEIRA-825',
    purchasePrice: 160.00,
    profitMargin: 118.125,
    salePrice: 349.00,
    stockQuantity: 15,
    featured: true,
    badge: 'PRO SERIES',
    sizes: ['7.75"', '8.0"', '8.25"', '8.5"'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpYTE2tlzvlBSYYkSydWPeKs_BAed9kB7N1-ClrA3TQbB6xUptcI71u5_CNa7YgMm_4NYB5imr4LVahYGzqysnyYzsOptOkxa7wskhKpKxflSctPeHxJjW6ORUnthWKzen2snyFjYEeJY-9qfDybv4uIXiF2LhFCSr-Bk6u2hBUjaq5dSGMsfRB1h8QJ5xS-ULG9Z5IMvwDhNbr3fBgRdIv_4MT4xWlLG9nMMZtvQL1ejr9NHzpeh_Zw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB15aD0macCSKBLzFmtb6OKYeUlggaJAxvZ7te09jloI7b2DZWeBG8Ct3hlY_zLv4ev9d-RgdBW__ri2pKE1nbIdjXKyudDFj1tQZJIQldjGeZc7O6ghtZETAjjsWhh-RADWgyiKRAX5PV9I5OGOBrvy5fq6HdjtdqFrJTCnsOtiDtGiHEAET2aL5CAZDSQQN_Qs_FOdhxH62EsfNE8-HKxO0Z-c29fbjvYdFWe3Kr5PrM-be-uAJSgYA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCX36s_9ihZYd6G-WBB8ZL7x6kF8UyYy0kmZJXgL5-aElgj7kquyoohKzub54ODB9f--AIhbDoqgPybux2Wje0n-PGlHZX0LL1PvMROvHdo-hIhrP6viOCn8YEKYWtKQnKEMFDa5-Q50rn-223LCnY0PMRVCpQUNJOHruwGuitY2RtaX9wruPi823KG_JpwaDQLGCbTEUVEJqKjoUl_X_beejyNc3Br1Ih4iL0q_eMcVd9EMZBRwIq_nA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4fL-41E7oXVYauIKqbxmnitXLx2lycU2ivqHX-1INVaknSAPJvH5Q35Bxp1RBW1lXsb7Tl4xDUjd9iAE_amJqMQBPvyCbba72-gdElBWM0MvpAR-wrdh5l7F6YENbM9pkOVN84n9sZLboP5gapT-0jh0_PHCCi_PVegQMNZaRxGWKe-5Mw_ptpc_xzhKbCtf8V5ijkoNsH4FLXtTY94URQfclArooBZvDvbBtZHwk5itbb3hZlwGc8g'
    ],
    specs: ['7-PLY CANADIAN MAPLE', 'DOUBLE KICK', 'MEDIUM CONCAVE', 'SIZE: 8.25"'],
    description: 'Designed for the streets. The Caveira Urban features a deep concave for maximum flick and control. Pressed with cold-climate maple for a rigid, long-lasting pop that withstands heavy impact. Raw performance, zero compromises.'
  },
  {
    id: 'prod-2',
    name: 'Shape Pro Concrete Series',
    category: 'Decks',
    brand: 'Florishop',
    sku: 'D-CONCRETE-80',
    purchasePrice: 180.00,
    profitMargin: 116.61,
    salePrice: 389.90,
    stockQuantity: 8,
    featured: true,
    badge: '7-PLY MAPLE',
    sizes: ['8.0"', '8.125"', '8.25"'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPrqGOByOI__lr6TW0_2kPRl_5bz1M5PIJpu-r365swaNSsmKoVTaOQfOOLaPV66zZdzzYGVrq06_gGwqa8ihCz9j0kbl3U7767uepASsJSXT_oGtZeKJMaQhIb5ShVJH7ZXSGHlHI4sH_8nBQcaolNX6mn04Qgy-A2-quESi4H0lNQRSTyv-KlpxwgtbIrzUd77DbcLfEZcmcmPm_IlcwlW5Gxm7jO0OjLbzmxa9QCBpxWJcSeTkTw'
    ],
    specs: ['CANADIAN MAPLE', 'CONCAVE ALTO', 'STREET & PARK', 'POP DURADOURO'],
    description: 'Resistência extrema para street e park. Concave alto para resposta rápida em manobras de borda e transição com tecnologia cold-pressed.'
  },
  {
    id: 'prod-3',
    name: 'Trucks Florishop Hollow Titanium',
    category: 'Trucks',
    brand: 'Florishop',
    sku: 'T-FLO-HOLLOW-139',
    purchasePrice: 220.00,
    profitMargin: 104.55,
    salePrice: 450.00,
    stockQuantity: 12,
    featured: true,
    badge: 'TITANIUM',
    sizes: ['139mm', '149mm'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nnbw67dCK-36whhcuVpmpHFEHeRDIBEfAqjugpsG1UX7ctlRT9OtqivMZpaV0sQKAQTz2WflhyIdYp-odpDcrSa4kWzk-4KSp-I3Fxq4bLpWgyOdzKtwnLnh0ScyugjHs4o2byPck69FkPdAiJVEdDBuMBZVr4VHcI9A8DRhQV_2pCCUYC-1dY_DYxi5M04zqthxTDRz17meKLeKfQPChRnvalpXMEJ_Jkqdubk3OZXTotcpcswew'
    ],
    specs: ['PINO CENTRAL HOLLOW', 'TITANIUM LIGA', '139MM', 'ALTA RESISTÊNCIA'],
    description: 'Eixo vazado ultra leve em liga de titânio. Resposta imediata nas curvas e moagem limpa em cantoneira de ferro ou concreto.'
  },
  {
    id: 'prod-4',
    name: 'Rodas Street Elite 54mm 101A',
    category: 'Wheels',
    brand: 'Florishop',
    sku: 'W-STREET-ELITE-54',
    purchasePrice: 90.00,
    profitMargin: 144.44,
    salePrice: 220.00,
    stockQuantity: 20,
    featured: true,
    badge: '101A',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfWJWQ9K6zbmR9_fkpnRV0UOTHoL6k766KS_pGuTFfqJNlm6tGe-UENGlxZKRfDahC0DqmQy2LfF3AJDOZ7DU39t5Rez3sWPNzj7-ctFenCZC0fMIywj6n0SVUTIWOlEemC-Lfdr0V-Wq6jUt2MbbvalwaGfId_j2XmjhvO8JwqCU8coGD-RnIS35g701A3FgZS-EzQv50fYUoauGZAReaNdnm1dNkf5KLvBqznj4PdTSL-3grtM7g0Q'
    ],
    specs: ['URETANO PREMIUM', '101A DUREZA', '54MM', 'ANTIFLATSPOT'],
    description: 'Fórmula de uretano anti-flatspot de alta densidade. Deslize controlado no powerslide e velocidade máxima em superfícies lisas.'
  },
  {
    id: 'prod-5',
    name: 'Rodas Street Conic 52mm',
    category: 'Wheels',
    brand: 'Florishop',
    sku: 'W-CONIC-52',
    purchasePrice: 80.00,
    profitMargin: 136.25,
    salePrice: 189.00,
    stockQuantity: 14,
    badge: 'NOVO',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEVbfUek8ZU3yyACqODt63HJcS5WWTi4UKwYhPbp1f1uLePorH1Jaq8HePWve5OJdv3BY_SAvv6lA7n-8GpfMagcsh7VIYQBaSj0_ZCWSWyw27IK3rWhjTGYhHkUlw_DecMWfHDNWcAhi0SR6NEN9Vm_mtxT6NTWxpt4IoEGtJ8CHOFrc5hsK-u7Q80pEe6VIrD5QjDs48o7lDqrQblBdlaPDccy3ILFZz22A7YqAz6Ef27FSSEmUDWw'
    ],
    specs: ['52MM', 'CORTE CÔNICO', 'URETANO FORMULA', 'HIGH POP'],
    description: 'Rodas cônicas ideais para street técnico e manobras de precisão. Travamento perfeito nos grinds.'
  },
  {
    id: 'prod-6',
    name: 'Trucks Raw Hollow 139mm',
    category: 'Trucks',
    brand: 'Florishop',
    sku: 'T-RAW-139',
    purchasePrice: 140.00,
    profitMargin: 113.57,
    salePrice: 299.00,
    stockQuantity: 6,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByA9Nrt6yzG_Khcc58XJMfnJIrXPt8-xnSy2z2dOsnHrUU14q3cJR7UE2CIYEuDfDctFflQ4xxj_XoLUIuBFYTBelETjsx1PeNcOhLboDZgzEuP6VuSy7AABD2e6Ri1LQ-4qdsCnLwS1nEp74Tdwp8aZgtoDeQC4LgaaQu9s-JAR976y3OB609PAMKlnCCwYpGFAA-VBHwl3ru-pwAR6q6jIeXmkx4RnknLzCGb9tFSQpqXXYOKL0cEg'
    ],
    specs: ['RAW FINISH', '139MM', 'HOLLOW KINGPIN', 'AMORTECEDOR 92A'],
    description: 'Construção bruta em alumínio reforçado com kingpin vazado para redução de peso sem perder tração.'
  },
  {
    id: 'prod-7',
    name: 'Trucks Independent Stage 11 Hollow Silver',
    category: 'Trucks',
    brand: 'Independent',
    sku: 'T-INDY-S11',
    purchasePrice: 180.00,
    profitMargin: 88.88,
    salePrice: 339.99,
    stockQuantity: 3, // Estoque baixo para testar alerta!
    badge: 'ESTOQUE BAIXO',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJkYq-NJUoPAPRWfNS0E-S1_8ZyGN9I4bt91tGdrUn-q_zgdMJuAsDvkZ9FTZ_Oozv7XO-EbvIwXA_AD1KBcuvMZO2rLRD9ckRS1g8gukLbYLTZSDWyXddPBavO3c5vKQE4MsVNxcAYvd5cMNkMVQM2wYmZrTHsGBN4veU2IkwaWVAT_KoyMnNoNaVPljVHpnLhf4gLOZlCzN6MWcvfjkRyRLxhXmavQ5B8nvHLwQcE2fYKxTX-w6RaQ'
    ],
    specs: ['149MM / 159MM', 'STAGE 11', 'LIGA 356 T6', 'INDY APPROVED'],
    description: 'O lendário truck Independent Stage 11 com trave levemente vazada. Durabilidade extrema e curva responsiva.'
  },
  {
    id: 'prod-8',
    name: 'Trucks Thunder Team Hollow Lights Black',
    category: 'Trucks',
    brand: 'Thunder',
    sku: 'T-THUN-TEAM',
    purchasePrice: 190.00,
    profitMargin: 94.73,
    salePrice: 369.99,
    stockQuantity: 5,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCIQBUXke0Mc6yA7QorAI9iTQoAD9pDa5NCZswURmMgTcwRZNJtF2dnNTkalPM-C2ikm6zf8gv4vRI-RzM-6Lp11u6bg8kGq91JRoIhqSmp37VgLdHmoeDF1wI1tz50Llex_o2pAjVD6ooPd1eH76SYuPUDxPYmFqxZ82CPa5NF2PSO0bLmEaIQlQaDBkoBYs8jDXd4_YnyNDQU1GPXdNFcenJTpQ-8nb9Hz0YmwNxybuO6AYxGA1TABA'
    ],
    specs: ['147MM / 149MM', 'MATTE BLACK', 'LIGHTWEIGHT BASEPLATE', 'QUICK TURN'],
    description: 'Design ultra baixo com geometria Thunder Quick Turn. Pintura eletrostática preta fosca de alta aderência.'
  },
  {
    id: 'prod-9',
    name: 'Trucks Venture V-Light Polished',
    category: 'Trucks',
    brand: 'Venture',
    sku: 'T-VENT-VLIGHT',
    purchasePrice: 150.00,
    profitMargin: 86.66,
    salePrice: 279.99,
    stockQuantity: 2, // Estoque baixo
    badge: 'PROMOÇÃO',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBaTRPmBdnleZ9QqnF10KsngoiYyxm216vo5i_2EKzuoFU4nmv8m3s83vIRcnO_WMsmGHGguwvoc8qujO5UwWNpprsHsN1oenFss8yOWj-ZtToN6w3tOCuN480i0Z2ozr2xgXrSA9eq3U0U6FJgZiko-mnDjh9CW7lsFbYSx6TPGWtmYoWrYfjjXqsoIcrKw7apBMOwmn6NHH3bnWTqKdc800CAhbbjM4KBBaW8pMdb1XLpeAhSfLFuJg'
    ],
    specs: ['5.2 HIGH', 'POLISHED ALUMINUM', 'HOLLOW KINGPIN', 'MADE IN USA'],
    description: 'A marca das praças e do street roots. Estabilidade garantida no grind e ótimo pop.'
  },
  {
    id: 'prod-10',
    name: 'Camiseta Heavyweight Tee Blk',
    category: 'Apparel',
    brand: 'Florishop',
    sku: 'A-TEE-BLK',
    purchasePrice: 45.00,
    profitMargin: 186.66,
    salePrice: 129.00,
    stockQuantity: 25,
    sizes: ['P', 'M', 'G', 'GG'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnFOEdGSYEdfts8FiY4a7adjSVliBDJ4MJEyQcx5zrOsaFobSiwjG3JckzgfqtdqFqIaeX7WubD9NsQYCJboCHV8WMU2k6y_Kk9jNatolwlq9GqZVCLnVMOG0cYg_jrI9l-T9uWzbXjnBmjc2eZXmPQpRFeZy9ZW1W0YalKJNkajBlU3-0qbUh1mAcNImVd3AiAlJHKQwze6aB3J7avXXVg_us2FJxcWt58lBi6zzJr4LFk2CcOiailg'
    ],
    specs: ['100% ALGODÃO 240G', 'GOLA 3CM REFORÇADA', 'MODELAGEM STREET'],
    description: 'Camiseta pesada de 240g com caimento amplo streetwear. Algodão macio com textura encorpada para a sessão diária.'
  },
  {
    id: 'prod-11',
    name: 'Lixa Emborrachada Premium Florishop',
    category: 'Hardware',
    brand: 'Florishop',
    sku: 'ACC-LIXA-EMB',
    purchasePrice: 18.00,
    profitMargin: 172.22,
    salePrice: 49.00,
    stockQuantity: 40,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB16y7G4ZUUXYE92fp2UwqIk6UJWLbnUrrWRXo5odEM3jSV3rYdez2uzBwx1dKFIPgu6noZzvuDNu9KOQU5IEE5wdgo3GKsM11O51uKVOi4TUrxstmSyGdj4ZOD2YM3Aq3E1n-FLf0ki8aMNUBuUhXqlpWIcSIhatnKduGZOyQuXFUMszp51FdKcg676PDVgp5Z1NdFfiRuq6Ld7BEo-S5vjkZgBVeipXf2OkP8t7Zyh4ygUJ9ZxU58qA'
    ],
    specs: ['GRANULAÇÃO 80', 'SISTEMA ANTI-BOLHA', 'SUPER GRIP', '33" X 9"'],
    description: 'Lixa de carboneto de silício com micro perfurações anti-bolha e cola de alta fixação para os pés ficarem cravados no shape.'
  },
  {
    id: 'prod-12',
    name: 'Rodas Spitfire Formula Four 99D Classic 54mm',
    category: 'Wheels',
    brand: 'Spitfire',
    sku: 'W-SPIT-F4-99-54',
    purchasePrice: 190.00,
    profitMargin: 84.21,
    salePrice: 350.00,
    stockQuantity: 11,
    featured: true,
    badge: 'FORMULA FOUR',
    sizes: ['52mm', '53mm', '54mm', '56mm'],
    images: [
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80'
    ],
    specs: ['URETANO F4 RESISTENTE A FLATSPOT', 'DUREZA 99D', 'CORTE CLASSIC', 'ALTA VELOCIDADE'],
    description: 'A roda mais famosa do mundo. O uretano Formula Four não amassa em powerslides e mantém a rolagem suave até em asfalto rugoso.'
  },
  {
    id: 'prod-13',
    name: 'Rodas Spitfire Conical Full 101D 52mm',
    category: 'Wheels',
    brand: 'Spitfire',
    sku: 'W-SPIT-F4-101-52',
    purchasePrice: 195.00,
    profitMargin: 84.10,
    salePrice: 359.00,
    stockQuantity: 8,
    badge: '101D SPEED',
    sizes: ['52mm', '53mm', '54mm'],
    images: [
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80'
    ],
    specs: ['DUREZA 101D ULTRA RÁPIDA', 'CORTE CONICAL FULL', 'SUPERFÍCIE DE CONTATO AMPLA'],
    description: 'Mais controle em bordas e coping de concreto. Dureza 101D para aceleração explosiva em parks e pistas de alta velocidade.'
  },
  {
    id: 'prod-14',
    name: 'Rolamentos Bones Reds Precision Skate',
    category: 'Hardware',
    brand: 'Outras',
    sku: 'HW-BONES-REDS',
    purchasePrice: 110.00,
    profitMargin: 80.90,
    salePrice: 199.00,
    stockQuantity: 24,
    featured: true,
    badge: 'BONES BEARINGS',
    images: [
      'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=800&q=80'
    ],
    specs: ['ESFERAS DE AÇO CROMADO', 'CAPA DE BORRACHA REMOVÍVEL', 'LUBRIFICADO SPEED CREAM'],
    description: 'O padrão da indústria do skate há décadas. Inspeção dupla contra folgas, rolagem rápida e fácil manutenção.'
  },
  {
    id: 'prod-15',
    name: 'Parafusos de Base Independent Phillips 1"',
    category: 'Hardware',
    brand: 'Independent',
    sku: 'HW-INDY-BOLTS-1',
    purchasePrice: 22.00,
    profitMargin: 122.72,
    salePrice: 49.00,
    stockQuantity: 30,
    badge: 'AÇO TEMPERADO',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
    ],
    specs: ['COMPRIMENTO 1 POLEGADA', 'CABEÇA PHILLIPS EMBUTIDA', 'PORCAS COM TRAVA NYLON'],
    description: 'Jogo completo de 8 parafusos pretos e 8 porcas auto-travantes com cabeça chanfrada que fica rente à lixa sem machucar a sola do tênis.'
  },
  {
    id: 'prod-16',
    name: 'Chave T Skate Tool Universal Florishop Pro',
    category: 'Hardware',
    brand: 'Florishop',
    sku: 'HW-TOOL-FLORI-T',
    purchasePrice: 28.00,
    profitMargin: 110.71,
    salePrice: 59.00,
    stockQuantity: 16,
    badge: 'MULTI-FERRAMENTA',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
    ],
    specs: ['BOCAL 3/8 (BASE)', 'BOCAL 1/2 (RODAS)', 'BOCAL 9/16 (CENTRAL)', 'CHAVE ALLEN / PHILLIPS'],
    description: 'Ferramenta completa para montar, regular o amortecedor e trocar rodas do skate em qualquer lugar. Acompanha chave L embutida.'
  },
  {
    id: 'prod-17',
    name: 'Moletom Canguru Heavyweight Florishop Skull',
    category: 'Apparel',
    brand: 'Florishop',
    sku: 'A-HOOD-FLORI-BLK',
    purchasePrice: 110.00,
    profitMargin: 135.45,
    salePrice: 259.00,
    stockQuantity: 12,
    featured: true,
    badge: 'HEAVY FLEECE 320G',
    sizes: ['P', 'M', 'G', 'GG'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'
    ],
    specs: ['MOLETOM 3 CABOS FLANELADO', 'CAPUZ DUPLO COM CORDÃO', 'BOLSO CANGURU REFORÇADO'],
    description: 'Blusa de moletom pesada 320g com forro flanelado quentinho e caimento solto para andar de skate sem prender o movimento dos braços.'
  },
  {
    id: 'prod-18',
    name: 'Camiseta Independent Truck Co Bar Cross',
    category: 'Apparel',
    brand: 'Independent',
    sku: 'A-INDY-TEE-BAR',
    purchasePrice: 65.00,
    profitMargin: 144.61,
    salePrice: 159.00,
    stockQuantity: 15,
    sizes: ['P', 'M', 'G', 'GG'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
    ],
    specs: ['100% ALGODÃO FIO 26.1 PENTEADO', 'ESTAMPA SERIGRAFIA SILK TOQUE ZERO', 'IMPORTADA'],
    description: 'Estampa clássica Independent Bar Cross no peito e nas costas. Conforto e caimento skate roots consagrado no mundo inteiro.'
  },
  {
    id: 'prod-19',
    name: 'Shape Independent Stage Canadian Maple 8.38"',
    category: 'Decks',
    brand: 'Independent',
    sku: 'D-INDY-MAPLE-838',
    purchasePrice: 190.00,
    profitMargin: 110.00,
    salePrice: 399.00,
    stockQuantity: 9,
    featured: true,
    badge: 'COLAB OFICIAL',
    sizes: ['8.25"', '8.38"', '8.5"'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPrqGOByOI__lr6TW0_2kPRl_5bz1M5PIJpu-r365swaNSsmKoVTaOQfOOLaPV66zZdzzYGVrq06_gGwqa8ihCz9j0kbl3U7767uepASsJSXT_oGtZeKJMaQhIb5ShVJH7ZXSGHlHI4sH_8nBQcaolNX6mn04Qgy-A2-quESi4H0lNQRSTyv-KlpxwgtbIrzUd77DbcLfEZcmcmPm_IlcwlW5Gxm7jO0OjLbzmxa9QCBpxWJcSeTkTw'
    ],
    specs: ['7 LÂMINAS HARD ROCK MAPLE', 'COLAGEM RESINA EPOXI', 'CONCAVE MÉDIO-ALTO', 'LARGURA 8.38"'],
    description: 'Madeira nobre importada de florestas canadenses com pop agressivo e furação milimétrica perfeita para trucks Independent.'
  },
  {
    id: 'prod-tenis-1',
    name: 'Tênis Skate Pro Florishop Street Vulcan Camurça',
    category: 'Tênis',
    brand: 'Florishop',
    sku: 'TEN-FLORI-VULC-BLK',
    purchasePrice: 160.00,
    profitMargin: 93.75,
    salePrice: 310.00,
    stockQuantity: 18,
    featured: true,
    badge: 'EXCLUSIVO FLORISHOP',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
    ],
    specs: [
      'SOLADO VULCANIZADO 100% BORRACHA NATURAL',
      'CAMURÇA SUÍNA RESISTENTE A LIXA',
      'PALMILHA PU ALTA DENSIDADE ANTI-IMPACTO',
      'REFORÇO NA BIQUEIRA E OLLIE PAD'
    ],
    description: 'Projetado pelos skatistas locais da Florishop para aguentar as sessões mais brutas na rua. Solado com máxima aderência na lixa e amaciamento instantâneo.'
  },
  {
    id: 'prod-tenis-2',
    name: 'Tênis Skate Old Skool Pro Black / White Suede',
    category: 'Tênis',
    brand: 'Vans',
    sku: 'TEN-VANS-OLDSK-PRO',
    purchasePrice: 220.00,
    profitMargin: 81.77,
    salePrice: 399.90,
    stockQuantity: 12,
    featured: true,
    badge: 'PRO MODEL CLÁSSICO',
    sizes: ['38', '39', '40', '41', '42', '43'],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'
    ],
    specs: [
      'PALMILHA POPCUSH DE ABSORÇÃO DE IMPACTO',
      'REFORÇO INTERNO DURACAP DE BORRACHA',
      'SOLADO WAFFLE ORIGINAL VANS',
      'CABEDAL EM CAMURÇA E LONA PESADA'
    ],
    description: 'O clássico mais respeitado das pistas e calçadões do mundo. Versão Pro Skate com tecnologia Duracap para não rasgar na lixa do shape.'
  },
  {
    id: 'prod-tenis-3',
    name: 'Tênis SB Dunk Low Pro Camurça Black / Gum',
    category: 'Tênis',
    brand: 'Nike SB',
    sku: 'TEN-NKSB-DUNK-GUM',
    purchasePrice: 320.00,
    profitMargin: 87.47,
    salePrice: 599.90,
    stockQuantity: 7,
    featured: true,
    badge: 'EDIÇÃO LIMITADA',
    sizes: ['39', '40', '41', '42', '43'],
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80'
    ],
    specs: [
      'AMORTECIMENTO ZOOM AIR NO CALCANHAR',
      'LÍNGUA ACOLCHOADA FAT TONGUE STREET',
      'SOLA CAIXA (CUPSOLE) COSTURADA 360°',
      'PIVOT CIRCLE NA SOLA PARA GIRO'
    ],
    description: 'Ícone supremo da cultura do skate e streetwear. Construção cupsole blindada para proteger os calcanhares em descidas de escadarias e gaps.'
  },
  {
    id: 'prod-tenis-4',
    name: 'Tênis Skate Busenitz Vulc II Core Carbon',
    category: 'Tênis',
    brand: 'Adidas',
    sku: 'TEN-ADI-BUSENITZ',
    purchasePrice: 210.00,
    profitMargin: 80.95,
    salePrice: 380.00,
    stockQuantity: 14,
    badge: 'PRECISÃO & BOARD FEEL',
    sizes: ['38', '39', '40', '41', '42', '44'],
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'
    ],
    specs: [
      'COLARINHO GEODISFIT ACOLCHOADO',
      'SOLADO VULCANIZADO VECTOR TRACTION',
      'BIQUEIRA ADITUFF RESISTENTE AO DESGASTE',
      'CAMURÇA PREMIUM PRETA'
    ],
    description: 'Inspirado na velocidade e controle milimétrico de Dennis Busenitz. Encaixe anatômico firme que parece uma extensão dos pés no skate.'
  },
  {
    id: 'prod-tenis-5',
    name: 'Tênis Skate Kalis OG Heritage Black / White',
    category: 'Tênis',
    brand: 'DC Shoes',
    sku: 'TEN-DC-KALIS-OG',
    purchasePrice: 240.00,
    profitMargin: 87.50,
    salePrice: 450.00,
    stockQuantity: 9,
    badge: 'ESTILO 90s RETRÔ',
    sizes: ['39', '40', '41', '42', '43'],
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80'
    ],
    specs: [
      'CABEDAL ROBUSTO MULTICAMADAS',
      'AIRBAG DE ABSORÇÃO DE IMPACTO NA SOLA',
      'FORRO INTERNO RESPIRÁVEL NATUREX',
      'SOLADO PILL PATTERN DC DE ALTA TRAÇÃO'
    ],
    description: 'Silhueta nostálgica dos anos dourados do skate de rua de San Francisco e Philly. Amortecimento pesado com proteção absoluta contra batidas de shape.'
  },
  {
    id: 'prod-tenis-6',
    name: 'Tênis Slip-On Pro Suede Florishop Coast',
    category: 'Tênis',
    brand: 'Florishop',
    sku: 'TEN-FLORI-SLIP-COAST',
    purchasePrice: 140.00,
    profitMargin: 99.28,
    salePrice: 279.00,
    stockQuantity: 15,
    badge: 'PRATICIDADE & CONFORTO',
    sizes: ['38', '39', '40', '41', '42', '43'],
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80'
    ],
    specs: [
      'SISTEMA SEM CADARÇO COM ELÁSTICO REFORÇADO',
      'PALMILHA EVA CONFORMADA 10MM',
      'SOLADO EM CAIXA VULCANIZADA',
      'CABEDAL FULL SUEDE'
    ],
    description: 'Praticidade sem perder a pegada na lixa. Sem cadarço para arrebentar na sessão, com ajuste firme que não sai do pé nas manobras de flip.'
  }
];

// Calculation Helper Functions
export function calculateSalePriceFromMargin(purchasePrice: number, marginPercentage: number): number {
  if (purchasePrice <= 0) return 0;
  return Number((purchasePrice * (1 + marginPercentage / 100)).toFixed(2));
}

export function calculateMarginFromSalePrice(purchasePrice: number, salePrice: number): number {
  if (purchasePrice <= 0 || salePrice <= 0) return 0;
  return Number((((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(2));
}

export function calculateUnitProfit(purchasePrice: number, salePrice: number): number {
  return Number((salePrice - purchasePrice).toFixed(2));
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Administrador Florishop',
    email: 'admin@florishop.com.br',
    password: 'admin123',
    phone: '(48) 99888-7766',
    cpf: '000.000.000-00',
    role: 'admin',
    createdAt: '2026-01-10T10:00:00.000Z',
    status: 'active',
    address: {
      cep: '88015-100',
      street: 'Av. Beira Mar Norte',
      number: '2500',
      complement: 'Loja 01',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC'
    }
  },
  {
    id: 'user-client-1',
    name: 'Lucas Gabriel',
    email: 'lucas.skater@gmail.com',
    password: 'skate123',
    phone: '(48) 98765-4321',
    cpf: '123.456.789-00',
    role: 'customer',
    createdAt: '2026-02-14T15:30:00.000Z',
    status: 'active',
    address: {
      cep: '88015-200',
      street: 'Rua Bocaiúva',
      number: '120',
      complement: 'Apto 402',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC'
    }
  },
  {
    id: 'user-client-2',
    name: 'Marina Costa',
    email: 'marina.costa@hotmail.com',
    password: 'marina123',
    phone: '(48) 99123-8899',
    cpf: '987.654.321-11',
    role: 'customer',
    createdAt: '2026-02-28T18:45:00.000Z',
    status: 'active',
    address: {
      cep: '88062-000',
      street: 'Avenida Pequeno Príncipe',
      number: '450',
      neighborhood: 'Campeche',
      city: 'Florianópolis',
      state: 'SC'
    }
  },
  {
    id: 'user-client-3',
    name: 'Rodrigo Santos (Mineiro)',
    email: 'rodrigo.sk8@yahoo.com.br',
    password: 'skate123',
    phone: '(11) 97123-4567',
    cpf: '456.789.123-22',
    role: 'customer',
    createdAt: '2026-03-01T11:20:00.000Z',
    status: 'active',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'FLO-849201',
    userId: 'user-client-1',
    date: '05/03/2026, 14:22:10',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        selectedSize: '8.25"',
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[10], // Parafuso de Base
        quantity: 1,
      },
      {
        product: {
          ...INITIAL_PRODUCTS[10],
          id: 'gift-adesivos-florishop',
          name: 'Pack de Adesivos Florishop Skate (10 unid)',
          salePrice: 0,
        },
        quantity: 1,
        isGift: true,
        customNote: 'Cortesia do Florishop Skate para o Lucas!',
      },
    ],
    subtotal: 374.00,
    discount: 18.70,
    shippingCost: 0,
    shippingMethod: 'PAC Correios - Convencional (Frete Grátis)',
    shippingAddress: {
      cep: '88015-200',
      street: 'Rua Bocaiúva',
      number: '120',
      complement: 'Apto 402',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
    },
    total: 355.30,
    paymentMethod: 'pix',
    paymentDetails: {
      pixKey: 'pix@florishop.com.br',
    },
    customerName: 'Lucas Gabriel',
    customerEmail: 'lucas.skater@gmail.com',
    customerPhone: '(48) 98765-4321',
    status: 'Em Separação',
    adminNotes: 'Cliente pediu para reforçar a embalagem do nose do deck.',
    trackingCode: 'BR492018245SC',
    statusHistory: [
      {
        id: 'sh-849201-1',
        fromStatus: 'Novo Pedido',
        status: 'Aguardando Pagamento',
        timestamp: '2026-03-05T14:22:10.000Z',
        formattedDate: '05/03/2026, 14:22:10',
        updatedBy: 'customer',
        authorName: 'Lucas Gabriel',
        notes: 'Pedido registrado na loja virtual via PIX',
      },
      {
        id: 'sh-849201-2',
        fromStatus: 'Aguardando Pagamento',
        status: 'Pago / Aprovado',
        timestamp: '2026-03-05T14:23:45.000Z',
        formattedDate: '05/03/2026, 14:23:45',
        updatedBy: 'system',
        authorName: 'Sistema Financeiro PIX',
        notes: 'Pagamento PIX liquidado instantaneamente',
      },
      {
        id: 'sh-849201-3',
        fromStatus: 'Pago / Aprovado',
        status: 'Em Separação',
        timestamp: '2026-03-05T15:10:00.000Z',
        formattedDate: '05/03/2026, 15:10:00',
        updatedBy: 'admin',
        authorName: 'Administrador Florishop',
        notes: 'Embalagem reforçada no nose solicitada pelo cliente',
      },
    ],
  },
  {
    id: 'FLO-710432',
    userId: 'user-client-2',
    date: '06/03/2026, 09:40:15',
    items: [
      {
        product: INITIAL_PRODUCTS[1], // Independent Stage 11
        selectedSize: '144mm',
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[2], // Spitfire Formula Four
        selectedSize: '53mm',
        quantity: 1,
      },
    ],
    subtotal: 918.00,
    discount: 0,
    shippingCost: 0,
    shippingMethod: 'Retirada no Skatepark / Loja Física (Grátis)',
    shippingAddress: {
      cep: '88062-000',
      street: 'Avenida Pequeno Príncipe',
      number: '450',
      neighborhood: 'Campeche',
      city: 'Florianópolis',
      state: 'SC',
    },
    total: 918.00,
    paymentMethod: 'maquininha',
    paymentDetails: {
      cardInstallments: '3x de R$ 306.00 sem juros',
      cardInterestRate: 0,
    },
    customerName: 'Marina Costa',
    customerEmail: 'marina.costa@hotmail.com',
    customerPhone: '(48) 99123-8899',
    status: 'Aguardando Pagamento',
    adminNotes: 'Retirada agendada para sábado de manhã no Skatepark.',
    statusHistory: [
      {
        id: 'sh-710432-1',
        fromStatus: 'Novo Pedido',
        status: 'Aguardando Pagamento',
        timestamp: '2026-03-06T09:40:15.000Z',
        formattedDate: '06/03/2026, 09:40:15',
        updatedBy: 'customer',
        authorName: 'Marina Costa',
        notes: 'Pedido realizado para pagamento presencial na maquininha',
      },
    ],
  },
  {
    id: 'FLO-602188',
    userId: 'user-client-3',
    date: '07/03/2026, 11:15:30',
    items: [
      {
        product: INITIAL_PRODUCTS[11], // Vans Half Cab 33 DX
        selectedSize: '41',
        quantity: 1,
      },
    ],
    subtotal: 549.90,
    discount: 0,
    shippingCost: 36.90,
    shippingMethod: 'SEDEX Correios - Expresso',
    shippingAddress: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    total: 586.80,
    paymentMethod: 'deposito',
    paymentDetails: {
      receiptAttached: true,
      receiptName: 'comprovante_banco_brasil_602188.pdf',
    },
    customerName: 'Rodrigo Santos (Mineiro)',
    customerEmail: 'rodrigo.sk8@yahoo.com.br',
    customerPhone: '(11) 97123-4567',
    status: 'Aguardando Comprovante / Validação',
    adminNotes: 'Aguardando compensação do depósito bancário para envio via SEDEX.',
    statusHistory: [
      {
        id: 'sh-602188-1',
        fromStatus: 'Novo Pedido',
        status: 'Aguardando Pagamento',
        timestamp: '2026-03-07T11:15:30.000Z',
        formattedDate: '07/03/2026, 11:15:30',
        updatedBy: 'customer',
        authorName: 'Rodrigo Santos (Mineiro)',
        notes: 'Pedido efetuado via Depósito Bancário',
      },
      {
        id: 'sh-602188-2',
        fromStatus: 'Aguardando Pagamento',
        status: 'Aguardando Comprovante / Validação',
        timestamp: '2026-03-07T11:25:00.000Z',
        formattedDate: '07/03/2026, 11:25:00',
        updatedBy: 'customer',
        authorName: 'Rodrigo Santos (Mineiro)',
        notes: 'Comprovante bancário anexado pelo cliente',
      },
    ],
  },
];


