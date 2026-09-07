export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  price: number;
  originalPrice?: number;
  deadline: string;
  tag?: string;
  isFree?: boolean;
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

export async function fetchAddressAndShipping(
  rawCep: string,
  subtotal: number
): Promise<{
  address: Partial<ShippingAddress>;
  options: ShippingOption[];
  source: 'viacep' | 'fallback';
}> {
  const cep = cleanCep(rawCep);
  let address: Partial<ShippingAddress> = {
    cep: formatCep(cep),
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  };
  let source: 'viacep' | 'fallback' = 'fallback';

  if (cep.length === 8) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          source = 'viacep';
          address = {
            cep: formatCep(cep),
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          };
        }
      }
    } catch {
      // Fallback em caso de erro de rede / timeout
      source = 'fallback';
    }
  }

  // Base de cálculo por região brasileira
  const uf = (address.state || '').toUpperCase();
  const firstDigit = cep.charAt(0);

  const isLocalSC = uf === 'SC' || firstDigit === '8';
  const isSouthOrSoutheast = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'].includes(uf) || ['0', '1', '2', '3', '8', '9'].includes(firstDigit);
  const isCentralNorthNortheast = !isLocalSC && !isSouthOrSoutheast;

  // Definição de preços
  let pacBasePrice = 22.90;
  let sedexBasePrice = 36.90;
  let motoboyAvailable = false;
  let motoboyPrice = 16.00;
  let pacDays = '5 a 8 dias úteis';
  let sedexDays = '2 a 3 dias úteis';

  if (isLocalSC) {
    pacBasePrice = 16.50;
    sedexBasePrice = 24.90;
    motoboyAvailable = true;
    motoboyPrice = 14.00;
    pacDays = '3 a 5 dias úteis';
    sedexDays = '1 a 2 dias úteis';
  } else if (isSouthOrSoutheast) {
    pacBasePrice = 22.90;
    sedexBasePrice = 36.90;
    pacDays = '4 a 7 dias úteis';
    sedexDays = '2 a 3 dias úteis';
  } else {
    // Centro-Oeste / Nordeste / Norte
    pacBasePrice = 32.90;
    sedexBasePrice = 52.90;
    pacDays = '7 a 12 dias úteis';
    sedexDays = '3 a 5 dias úteis';
  }

  // Regra de Frete Grátis acima de R$ 250
  const isFreePacEligible = subtotal >= 250;

  const options: ShippingOption[] = [];

  // Opção PAC
  options.push({
    id: 'pac',
    name: 'PAC Correios - Convencional',
    carrier: 'Correios',
    price: isFreePacEligible ? 0 : pacBasePrice,
    originalPrice: isFreePacEligible ? pacBasePrice : undefined,
    deadline: pacDays,
    isFree: isFreePacEligible,
    tag: isFreePacEligible ? 'FRETE GRÁTIS' : 'Econômico',
  });

  // Opção SEDEX
  options.push({
    id: 'sedex',
    name: 'SEDEX Correios - Expresso',
    carrier: 'Correios',
    price: sedexBasePrice,
    deadline: sedexDays,
    tag: 'Mais Rápido',
  });

  // Opção Motoboy (disponível para SC ou opção expressa)
  if (motoboyAvailable || isLocalSC) {
    options.push({
      id: 'motoboy',
      name: 'Entrega Expressa / Motoboy Local',
      carrier: 'Florishop Express',
      price: motoboyPrice,
      deadline: 'Até 24 horas (mesmo dia)',
      tag: 'Entrega Rápida Local',
    });
  }

  // Opção Retirada Grátis
  options.push({
    id: 'retirada',
    name: 'Retirada no Skatepark / Loja Física',
    carrier: 'Florishop Skate',
    price: 0,
    deadline: 'Disponível em até 2 horas',
    isFree: true,
    tag: 'Sem Custo de Envio',
  });

  return { address, options, source };
}
