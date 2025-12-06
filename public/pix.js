/**
 * Gerador de Pix Copia e Cola - Versão JavaScript para navegador
 * Portado da versão TypeScript
 */

function createEMVField(id, value) {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

function calculateCRC16(payload) {
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

function normalizeMerchantName(name) {
    const normalized = name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9 ]/g, '')
        .trim()
        .substring(0, 25);

    if (normalized.length === 0) {
        throw new Error('Nome do recebedor inválido');
    }

    return normalized;
}

function normalizeMerchantCity(city) {
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

function validatePixKey(key) {
    if (!key || key.trim().length === 0) {
        throw new Error('Chave Pix não pode ser vazia');
    }
    if (key.length > 77) {
        throw new Error('Chave Pix muito longa (máx. 77 caracteres)');
    }
}

function formatAmount(amount) {
    if (amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
    }
    if (amount > 999999999.99) {
        throw new Error('Valor muito alto');
    }
    return amount.toFixed(2);
}

function gerarPixCopiaCola(config) {
    validatePixKey(config.pixKey);
    const merchantName = normalizeMerchantName(config.merchantName);
    const merchantCity = normalizeMerchantCity(config.merchantCity);

    const payloadFormat = createEMVField('00', '01');

    const gui = createEMVField('00', 'BR.GOV.BCB.PIX');
    const pixKey = createEMVField('01', config.pixKey);
    
    let merchantAccountInfo = gui + pixKey;
    if (config.description) {
        const description = config.description.substring(0, 72);
        merchantAccountInfo += createEMVField('02', description);
    }
    
    const merchantAccount = createEMVField('26', merchantAccountInfo);
    const merchantCategory = createEMVField('52', '0000');
    const currency = createEMVField('53', '986');

    let amountField = '';
    let formattedAmount;
    if (config.amount !== undefined) {
        formattedAmount = formatAmount(config.amount);
        amountField = createEMVField('54', formattedAmount);
    }

    const countryCode = createEMVField('58', 'BR');
    const merchant = createEMVField('59', merchantName);
    const city = createEMVField('60', merchantCity);

    let additionalData = '';
    if (config.txid) {
        const txid = config.txid.substring(0, 25);
        const txidField = createEMVField('05', txid);
        additionalData = createEMVField('62', txidField);
    }

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
        '6304';

    const crc = calculateCRC16(payload);
    payload += crc;

    return {
        payload,
        qrCode: payload,
        info: {
            pixKey: config.pixKey,
            merchantName,
            merchantCity,
            amount: formattedAmount,
            txid: config.txid,
        },
    };
}
