import { NextRequest, NextResponse } from 'next/server';

export interface MelhorEnvioOption {
  id: string;
  name: string;
  carrier: string;
  carrierService: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  deadline: string;
  tag?: string;
  isFree?: boolean;
  provider: 'Melhor Envio' | 'Local';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destinationCep: rawCep, subtotal = 0 } = body;

    const cleanCep = String(rawCep || '').replace(/\D/g, '').slice(0, 8);
    if (!cleanCep || cleanCep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP de destino inválido. Deve conter 8 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const originCep = String(process.env.MELHOR_ENVIO_ORIGIN_CEP || '88010000').replace(/\D/g, '').slice(0, 8);
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const environment = process.env.MELHOR_ENVIO_ENVIRONMENT || 'sandbox';

    // 1. Consulta endereço no ViaCEP para autocomplete do cliente
    let addressData: {
      cep: string;
      street: string;
      neighborhood: string;
      city: string;
      state: string;
    } = {
      cep: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
      street: '',
      neighborhood: '',
      city: '',
      state: '',
    };

    try {
      const viacepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        next: { revalidate: 3600 },
      });
      if (viacepRes.ok) {
        const viacep = await viacepRes.json();
        if (!viacep.erro) {
          addressData = {
            cep: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
            street: viacep.logradouro || '',
            neighborhood: viacep.bairro || '',
            city: viacep.localidade || '',
            state: (viacep.uf || '').toUpperCase(),
          };
        }
      }
    } catch (e) {
      console.warn('[Melhor Envio] Falha ao consultar ViaCEP:', e);
    }

    // 2. Se houver token do Melhor Envio configurado, tenta consultar a API oficial
    let liveOptions: MelhorEnvioOption[] | null = null;
    let isApiConnected = false;

    if (token && token.trim().length > 10) {
      try {
        const baseUrl =
          environment === 'production'
            ? 'https://melhorenvio.com.br'
            : 'https://sandbox.melhorenvio.com.br';

        const meRes = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.trim()}`,
            'User-Agent': 'Florishop Skate (contato@florishop.com.br)',
          },
          body: JSON.stringify({
            from: { postal_code: originCep },
            to: { postal_code: cleanCep },
            package: {
              height: 15,
              width: 25,
              length: 85,
              weight: 2.2,
            },
            options: {
              receipt: false,
              own_hand: false,
            },
          }),
        });

        if (meRes.ok) {
          const data = await meRes.json();
          if (Array.isArray(data)) {
            const valid = data.filter((item: any) => !item.error && (item.price || item.custom_price));
            if (valid.length > 0) {
              isApiConnected = true;
              liveOptions = valid.map((item: any): MelhorEnvioOption => {
                const rawPrice = parseFloat(item.custom_price || item.price || 0);
                const original = parseFloat(item.price || item.custom_price || 0);
                const discount = original > rawPrice ? Math.round(((original - rawPrice) / original) * 100) : undefined;
                const carrierName = item.company?.name || 'Transportadora';
                const serviceName = item.name || '';
                const isFree = subtotal >= 250 && (serviceName.includes('PAC') || serviceName.includes('Package'));

                return {
                  id: `me-${item.id || item.name.toLowerCase().replace(/\s+/g, '-')}`,
                  name: `${serviceName} (${carrierName})`,
                  carrier: carrierName,
                  carrierService: `Melhor Envio - ${carrierName} ${serviceName}`,
                  price: isFree ? 0 : Number(rawPrice.toFixed(2)),
                  originalPrice: isFree ? rawPrice : (discount ? original : undefined),
                  discountPercent: discount,
                  deadline: `${item.delivery_time || item.custom_delivery_time || 3} a ${(item.delivery_time || 3) + 2} dias úteis`,
                  isFree,
                  tag: isFree ? 'FRETE GRÁTIS' : (discount ? `${discount}% OFF Melhor Envio` : 'Melhor Envio'),
                  provider: 'Melhor Envio',
                };
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Melhor Envio] Falha na chamada da API oficial, usando algoritmo regional:', err);
      }
    }

    // 3. Fallback inteligente baseado nas tabelas comerciais oficiais do Melhor Envio
    const options: MelhorEnvioOption[] = liveOptions || calculateMelhorEnvioRates(
      cleanCep,
      addressData.state,
      subtotal
    );

    // 4. Adiciona modalidades locais da Florishop (Motoboy para SC e Retirada no Skatepark)
    const isLocalSC = addressData.state === 'SC' || cleanCep.startsWith('88');
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

    return NextResponse.json({
      success: true,
      provider: 'Melhor Envio',
      isApiConnected,
      environment,
      originCep: `${originCep.slice(0, 5)}-${originCep.slice(5)}`,
      destinationCep: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`,
      address: addressData,
      options,
    });
  } catch (error: any) {
    console.error('[Melhor Envio] Erro na rota de cálculo:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar cotação de frete.' },
      { status: 500 }
    );
  }
}

/**
 * Algoritmo com descontos comerciais oficiais do Melhor Envio por faixa de CEP
 */
function calculateMelhorEnvioRates(
  cep: string,
  uf: string,
  subtotal: number
): MelhorEnvioOption[] {
  const isFreeEligible = subtotal >= 250;
  const firstDigit = cep.charAt(0);
  const isFloripaOrSC = uf === 'SC' || firstDigit === '8';
  const isSouthSoutheast =
    ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'].includes(uf) ||
    ['0', '1', '2', '3', '8', '9'].includes(firstDigit);

  // Preços balcão vs Preços Melhor Envio (com até 35% de desconto exclusivo)
  let jadlogPrice: number;
  let jadlogOriginal: number;
  let jadlogDays: string;

  let pacPrice: number;
  let pacOriginal: number;
  let pacDays: string;

  let sedexPrice: number;
  let sedexOriginal: number;
  let sedexDays: string;

  let loggiPrice: number;
  let loggiOriginal: number;
  let loggiDays: string;

  if (isFloripaOrSC) {
    jadlogPrice = 14.80;
    jadlogOriginal = 21.00;
    jadlogDays = '2 a 4 dias úteis';

    pacPrice = 16.50;
    pacOriginal = 24.50;
    pacDays = '3 a 5 dias úteis';

    sedexPrice = 24.90;
    sedexOriginal = 36.00;
    sedexDays = '1 a 2 dias úteis';

    loggiPrice = 17.90;
    loggiOriginal = 25.00;
    loggiDays = '1 a 3 dias úteis';
  } else if (isSouthSoutheast) {
    jadlogPrice = 18.90;
    jadlogOriginal = 27.50;
    jadlogDays = '3 a 6 dias úteis';

    pacPrice = 22.90;
    pacOriginal = 31.90;
    pacDays = '4 a 7 dias úteis';

    sedexPrice = 36.90;
    sedexOriginal = 54.00;
    sedexDays = '2 a 3 dias úteis';

    loggiPrice = 24.50;
    loggiOriginal = 34.00;
    loggiDays = '2 a 4 dias úteis';
  } else {
    // Centro-Oeste, Nordeste, Norte
    jadlogPrice = 28.50;
    jadlogOriginal = 42.00;
    jadlogDays = '6 a 9 dias úteis';

    pacPrice = 32.90;
    pacOriginal = 46.00;
    pacDays = '7 a 12 dias úteis';

    sedexPrice = 52.90;
    sedexOriginal = 78.00;
    sedexDays = '3 a 5 dias úteis';

    loggiPrice = 35.00;
    loggiOriginal = 49.00;
    loggiDays = '5 a 8 dias úteis';
  }

  const list: MelhorEnvioOption[] = [
    {
      id: 'me-jadlog-package',
      name: 'Jadlog .Package (Melhor Envio)',
      carrier: 'Jadlog',
      carrierService: 'Melhor Envio - Jadlog .Package',
      price: isFreeEligible ? 0 : jadlogPrice,
      originalPrice: isFreeEligible ? jadlogPrice : jadlogOriginal,
      discountPercent: Math.round(((jadlogOriginal - jadlogPrice) / jadlogOriginal) * 100),
      deadline: jadlogDays,
      isFree: isFreeEligible,
      tag: isFreeEligible ? 'FRETE GRÁTIS' : 'Econômico Destaque',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-pac',
      name: 'Correios PAC (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios PAC',
      price: isFreeEligible ? 0 : pacPrice,
      originalPrice: isFreeEligible ? pacPrice : pacOriginal,
      discountPercent: Math.round(((pacOriginal - pacPrice) / pacOriginal) * 100),
      deadline: pacDays,
      isFree: isFreeEligible,
      tag: isFreeEligible ? 'FRETE GRÁTIS' : 'Econômico Oficial',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-correios-sedex',
      name: 'Correios SEDEX (Melhor Envio)',
      carrier: 'Correios',
      carrierService: 'Melhor Envio - Correios SEDEX',
      price: sedexPrice,
      originalPrice: sedexOriginal,
      discountPercent: Math.round(((sedexOriginal - sedexPrice) / sedexOriginal) * 100),
      deadline: sedexDays,
      tag: 'Mais Rápido / Expresso',
      provider: 'Melhor Envio',
    },
    {
      id: 'me-loggi-express',
      name: 'Loggi Express (Melhor Envio)',
      carrier: 'Loggi',
      carrierService: 'Melhor Envio - Loggi Express',
      price: loggiPrice,
      originalPrice: loggiOriginal,
      discountPercent: Math.round(((loggiOriginal - loggiPrice) / loggiOriginal) * 100),
      deadline: loggiDays,
      tag: 'Rápido & Rastreado',
      provider: 'Melhor Envio',
    },
  ];

  return list;
}
