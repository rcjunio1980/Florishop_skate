export const SHIPPING_ORIGIN = {
  cep: '07135-040',
  cepRaw: '07135040',
  street: 'Rua Joana reche reche',
  number: '117',
  neighborhood: 'Jardim Adriana',
  city: 'Guarulhos',
  state: 'SP',
  fullAddress: 'Rua Joana reche reche, 117 — CEP 07135-040, Jardim Adriana, Guarulhos - SP',
};

export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  carrierService?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  deadline: string;
  tag?: string;
  isFree?: boolean;
  provider?: 'Melhor Envio' | 'Local';
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export function cleanCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

export interface ShippingCalculationResult {
  address: Partial<ShippingAddress>;
  options: ShippingOption[];
  source: 'melhor-envio-api' | 'melhor-envio-smart' | 'viacep' | 'fallback';
  provider: 'Melhor Envio';
  isApiConnected?: boolean;
}

/**
 * Consulta cotação oficial via rota do Melhor Envio (/api/shipping/melhor-envio).
 * Em caso de falha de conexão, aplica o motor regional com tarifas do Melhor Envio.
 */
export async function fetchAddressAndShipping(
  rawCep: string,
  subtotal: number
): Promise<ShippingCalculationResult> {
  const cep = cleanCep(rawCep);

  if (cep.length !== 8) {
    return {
      address: {
        cep: formatCep(rawCep),
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      options: [],
      source: 'fallback',
      provider: 'Melhor Envio',
    };
  }

  // 1. Tentar consultar através da API interna do Melhor Envio
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('/api/shipping/melhor-envio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationCep: cep, subtotal }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.options && Array.isArray(data.options)) {
        return {
          address: data.address || { cep: formatCep(cep) },
          options: data.options,
          source: data.isApiConnected ? 'melhor-envio-api' : 'melhor-envio-smart',
          provider: 'Melhor Envio',
          isApiConnected: data.isApiConnected,
        };
      }
    }
  } catch (err) {
    console.warn('[Frete] Chamada API falhou, utilizando motor local de fallback:', err);
  }

  // 2. Fallback direto cliente (caso offline ou erro de rota)
  let address: Partial<ShippingAddress> = {
    cep: formatCep(cep),
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  };

  try {
    const viacepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (viacepRes.ok) {
      const v = await viacepRes.json();
      if (!v.erro) {
        address = {
          cep: formatCep(cep),
          street: v.logradouro || '',
          neighborhood: v.bairro || '',
          city: v.localidade || '',
          state: (v.uf || '').toUpperCase(),
        };
      }
    }
  } catch {
    // ignore
  }

  const uf = (address.state || '').toUpperCase();
  const firstDigit = cep.charAt(0);
  const isLocalGuarulhosSP = uf === 'SP' || firstDigit === '0' || firstDigit === '1';
  const isSouthSoutheast =
    ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'].includes(uf) ||
    ['0', '1', '2', '3', '8', '9'].includes(firstDigit);

  // Preços calculados a partir da Origem: Rua Joana reche reche, 117 — CEP 07135-040, Jardim Adriana, Guarulhos - SP
  // Sem modalidade de frete grátis (frete grátis desativado por solicitação da loja)
  const jadlogBase = isLocalGuarulhosSP ? 14.90 : isSouthSoutheast ? 19.80 : 29.50;
  const pacBase = isLocalGuarulhosSP ? 16.20 : isSouthSoutheast ? 23.40 : 33.90;
  const sedexBase = isLocalGuarulhosSP ? 21.90 : isSouthSoutheast ? 34.50 : 54.90;
  const loggiBase = isLocalGuarulhosSP ? 15.90 : isSouthSoutheast ? 22.80 : 36.00;

  const options: ShippingOption[] = [
    {
      id: 'me-jadlog-package',
      name: 'Jadlog .Package (Melhor Envio)',
      carrier: 'Jadlog',
      carrierService: 'Melhor Envio - Jadlog .Package',
      price: jadlogBase,
      deadline: isLocalGuarulhosSP ? '1 a 3 dias úteis' : isSouthSoutheast ? '3 a 6 dias úteis' : '6 a 9 dias úteis',
      isFree: false,
      tag: 'Econômico Destaque',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-pac',
      name: 'Correios PAC (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios PAC',
      price: pacBase,
      deadline: isLocalGuarulhosSP ? '2 a 4 dias úteis' : isSouthSoutheast ? '4 a 7 dias úteis' : '7 a 12 dias úteis',
      isFree: false,
      tag: 'Econômico Oficial',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-sedex',
      name: 'Correios SEDEX (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios SEDEX',
      price: sedexBase,
      deadline: isLocalGuarulhosSP ? '1 a 2 dias úteis' : isSouthSoutheast ? '2 a 3 dias úteis' : '3 a 5 dias úteis',
      isFree: false,
      tag: 'Mais Rápido / Expresso',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-loggi-express',
      name: 'Loggi Express (Melhor Envio)',
      carrier: 'Loggi',
      carrierService: 'Melhor Envio - Loggi Express',
      price: loggiBase,
      deadline: isLocalGuarulhosSP ? '1 a 2 dias úteis' : isSouthSoutheast ? '2 a 4 dias úteis' : '5 a 8 dias úteis',
      isFree: false,
      tag: 'Rápido & Rastreado',
      provider: 'Melhor Envio',
    },
  ];

  // Entrega Expressa por Motoboy para Grande São Paulo / Guarulhos
  if (isLocalGuarulhosSP) {
    options.push({
      id: 'florishop-motoboy',
      name: 'Motoboy Expresso (Guarulhos & Grande SP)',
      carrier: 'Florishop Express',
      carrierService: 'Florishop Express Motoboy',
      price: 18.00,
      deadline: 'Até 24 horas (mesmo dia)',
      isFree: false,
      tag: 'Entrega Rápida Local',
      provider: 'Local',
    });
  }

  // Apenas opções com cobrança real (nenhuma opção gratuita)
  const nonFreeOptions = options.filter((opt) => !opt.isFree && opt.price > 0);

  return {
    address,
    options: nonFreeOptions,
    source: 'melhor-envio-smart',
    provider: 'Melhor Envio',
  };
}
