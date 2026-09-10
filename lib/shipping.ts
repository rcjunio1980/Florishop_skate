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
  const isLocalSC = uf === 'SC' || firstDigit === '8';
  const isSouthSoutheast =
    ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'].includes(uf) ||
    ['0', '1', '2', '3', '8', '9'].includes(firstDigit);

  const isFreeEligible = subtotal >= 250;

  const jadlogBase = isLocalSC ? 14.80 : isSouthSoutheast ? 18.90 : 28.50;
  const pacBase = isLocalSC ? 16.50 : isSouthSoutheast ? 22.90 : 32.90;
  const sedexBase = isLocalSC ? 24.90 : isSouthSoutheast ? 36.90 : 52.90;
  const loggiBase = isLocalSC ? 17.90 : isSouthSoutheast ? 24.50 : 35.00;

  const options: ShippingOption[] = [
    {
      id: 'me-jadlog-package',
      name: 'Jadlog .Package (Melhor Envio)',
      carrier: 'Jadlog',
      carrierService: 'Melhor Envio - Jadlog .Package',
      price: isFreeEligible ? 0 : jadlogBase,
      originalPrice: isFreeEligible ? jadlogBase : undefined,
      deadline: isLocalSC ? '2 a 4 dias úteis' : isSouthSoutheast ? '3 a 6 dias úteis' : '6 a 9 dias úteis',
      isFree: isFreeEligible,
      tag: isFreeEligible ? 'FRETE GRÁTIS' : 'Econômico Destaque',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-pac',
      name: 'Correios PAC (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios PAC',
      price: isFreeEligible ? 0 : pacBase,
      originalPrice: isFreeEligible ? pacBase : undefined,
      deadline: isLocalSC ? '3 a 5 dias úteis' : isSouthSoutheast ? '4 a 7 dias úteis' : '7 a 12 dias úteis',
      isFree: isFreeEligible,
      tag: isFreeEligible ? 'FRETE GRÁTIS' : 'Econômico Oficial',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-sedex',
      name: 'Correios SEDEX (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios SEDEX',
      price: sedexBase,
      deadline: isLocalSC ? '1 a 2 dias úteis' : isSouthSoutheast ? '2 a 3 dias úteis' : '3 a 5 dias úteis',
      tag: 'Mais Rápido / Expresso',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-loggi-express',
      name: 'Loggi Express (Melhor Envio)',
      carrier: 'Loggi',
      carrierService: 'Melhor Envio - Loggi Express',
      price: loggiBase,
      deadline: isLocalSC ? '1 a 3 dias úteis' : isSouthSoutheast ? '2 a 4 dias úteis' : '5 a 8 dias úteis',
      tag: 'Rápido & Rastreado',
      provider: 'Melhor Envio',
    },
  ];

  if (isLocalSC) {
    options.push({
      id: 'florishop-motoboy',
      name: 'Entrega Expressa / Motoboy Local',
      carrier: 'Florishop Express',
      carrierService: 'Florishop Express Motoboy',
      price: 14.00,
      deadline: 'Até 24 horas (mesmo dia)',
      tag: 'Entrega Rápida Local',
      provider: 'Local',
    });
  }

  options.push({
    id: 'florishop-retirada',
    name: 'Retirada no Skatepark / Loja Física',
    carrier: 'Florishop Skate',
    carrierService: 'Retirada Presencial no Skatepark',
    price: 0,
    deadline: 'Disponível em até 2 horas',
    isFree: true,
    tag: 'Sem Custo de Envio',
    provider: 'Local',
  });

  return {
    address,
    options,
    source: 'melhor-envio-smart',
    provider: 'Melhor Envio',
  };
}
