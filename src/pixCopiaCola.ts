/**
 * Gerador de Pix Copia e Cola
 * Implementação pura em TypeScript do padrão EMV-Co do Banco Central
 * 
 * @author Yasmin Lopes
 * @license MIT
 */

export interface PixConfig {
  /** Chave Pix (CPF, CNPJ, email, telefone, ou chave aleatória) */
  pixKey: string;
  /** Nome do recebedor (máx. 25 caracteres) */
  merchantName: string;
  /** Cidade do recebedor (máx. 15 caracteres) */
  merchantCity: string;
  /** Valor da transação (opcional) - Ex: 49.90 */
  amount?: number;
  /** ID da transação (opcional) - útil para controle interno */
  txid?: string;
  /** Descrição adicional (opcional) */
  description?: string;
}

export interface PixPayload {
  /** Payload completo pronto para copiar */
  payload: string;
  /** QR Code data (mesmo conteúdo do payload) */
  qrCode: string;
  /** Informações do Pix gerado */
  info: {
    pixKey: string;
    merchantName: string;
    merchantCity: string;
    amount?: string;
    txid?: string;
  };
}

/**
 * Cria um campo EMV seguindo o padrão ID + TAMANHO + VALOR
 * @param id - Identificador de 2 dígitos
 * @param value - Valor do campo
 */
function createEMVField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Calcula CRC16-CCITT conforme especificação do Banco Central
 * Polinômio: 0x1021
 * Valor inicial: 0xFFFF
 */
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Normaliza e valida o nome do recebedor
 */
function normalizeMerchantName(name: string): string {
  const normalized = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^A-Z0-9 ]/g, '') // Remove caracteres especiais
    .trim()
    .substring(0, 25);

  if (normalized.length === 0) {
    throw new Error('Nome do recebedor inválido');
  }

  return normalized;
}

/**
 * Normaliza e valida a cidade
 */
function normalizeMerchantCity(city: string): string {
  const normalized = city
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .substring(0, 15);

  if (normalized.length === 0) {
    throw new Error('Cidade inválida');
  }

  return normalized;
}

/**
 * Valida a chave Pix
 */
function validatePixKey(key: string): void {
  if (!key || key.trim().length === 0) {
    throw new Error('Chave Pix não pode ser vazia');
  }
  if (key.length > 77) {
    throw new Error('Chave Pix muito longa (máx. 77 caracteres)');
  }
}

/**
 * Formata o valor monetário
 */
function formatAmount(amount: number): string {
  if (amount <= 0) {
    throw new Error('Valor deve ser maior que zero');
  }
  if (amount > 999999999.99) {
    throw new Error('Valor muito alto');
  }
  return amount.toFixed(2);
}

/**
 * Gera o payload Pix Copia e Cola completo
 * 
 * @param config - Configurações do Pix
 * @returns Payload completo com todas as informações
 * 
 * @example
 * ```ts
 * const pix = gerarPixCopiaCola({
 *   pixKey: '12345678900',
 *   merchantName: 'FULANO TEC',
 *   merchantCity: 'MARILIA',
 *   amount: 49.90,
 *   txid: 'PEDIDO123'
 * });
 * console.log(pix.payload);
 * ```
 */
export function gerarPixCopiaCola(config: PixConfig): PixPayload {
  // Validações
  validatePixKey(config.pixKey);
  const merchantName = normalizeMerchantName(config.merchantName);
  const merchantCity = normalizeMerchantCity(config.merchantCity);

  // ID 00 - Payload Format Indicator (sempre "01")
  const payloadFormat = createEMVField('00', '01');

  // ID 26 - Merchant Account Information (GUI + Chave Pix)
  const gui = createEMVField('00', 'BR.GOV.BCB.PIX');
  const pixKey = createEMVField('01', config.pixKey);
  
  // Se tiver descrição, adiciona no campo 02
  let merchantAccountInfo = gui + pixKey;
  if (config.description) {
    const description = config.description.substring(0, 72);
    merchantAccountInfo += createEMVField('02', description);
  }
  
  const merchantAccount = createEMVField('26', merchantAccountInfo);

  // ID 52 - Merchant Category Code (sempre "0000")
  const merchantCategory = createEMVField('52', '0000');

  // ID 53 - Transaction Currency (986 = BRL)
  const currency = createEMVField('53', '986');

  // ID 54 - Transaction Amount (opcional)
  let amountField = '';
  let formattedAmount: string | undefined;
  if (config.amount !== undefined) {
    formattedAmount = formatAmount(config.amount);
    amountField = createEMVField('54', formattedAmount);
  }

  // ID 58 - Country Code (BR)
  const countryCode = createEMVField('58', 'BR');

  // ID 59 - Merchant Name
  const merchant = createEMVField('59', merchantName);

  // ID 60 - Merchant City
  const city = createEMVField('60', merchantCity);

  // ID 62 - Additional Data Field Template (TXID)
  let additionalData = '';
  if (config.txid) {
    const txid = config.txid.substring(0, 25);
    const txidField = createEMVField('05', txid);
    additionalData = createEMVField('62', txidField);
  }

  // Monta o payload sem CRC
  let payload = 
    payloadFormat +
    merchantAccount +
    merchantCategory +
    currency +
    amountField +
    countryCode +
    merchant +
    city +
    additionalData +
    '6304'; // ID 63 + tamanho 04 (CRC placeholder)

  // Calcula e adiciona CRC16
  const crc = calculateCRC16(payload);
  payload += crc;

  return {
    payload,
    qrCode: payload, // O QR Code é o mesmo payload
    info: {
      pixKey: config.pixKey,
      merchantName,
      merchantCity,
      amount: formattedAmount,
      txid: config.txid,
    },
  };
}

/**
 * Valida se um payload Pix está no formato correto
 * @param payload - Payload a ser validado
 */
export function validarPixPayload(payload: string): boolean {
  if (!payload || payload.length < 50) {
    return false;
  }

  // Verifica se começa com "000201" (Payload Format)
  if (!payload.startsWith('000201')) {
    return false;
  }

  // Verifica se termina com CRC (últimos 4 caracteres são HEX)
  const crcPart = payload.slice(-4);
  if (!/^[0-9A-F]{4}$/.test(crcPart)) {
    return false;
  }

  // Valida CRC
  const payloadWithoutCRC = payload.slice(0, -4);
  const expectedCRC = calculateCRC16(payloadWithoutCRC);
  
  return crcPart === expectedCRC;
}
