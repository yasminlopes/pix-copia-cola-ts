/**
 * Exemplo de uso básico do Pix Copia e Cola
 */

import { gerarPixCopiaCola, validarPixPayload } from '../src';

console.log('🔥 Exemplos de Pix Copia e Cola\n');

// ====================================
// EXEMPLO 1: Pix sem valor (doação)
// ====================================
console.log('📌 EXEMPLO 1: Pix sem valor definido');
const pixDonation = gerarPixCopiaCola({
  pixKey: 'contato@FULANO.com.br',
  merchantName: 'FULANO TEC',
  merchantCity: 'MARILIA',
});

console.log('Payload:', pixDonation.payload);
console.log('Válido:', validarPixPayload(pixDonation.payload));
console.log('Info:', pixDonation.info);
console.log('\n');

// ====================================
// EXEMPLO 2: Pix com valor fixo
// ====================================
console.log('📌 EXEMPLO 2: Pix com valor fixo');
const pixWithAmount = gerarPixCopiaCola({
  pixKey: '12345678900',
  merchantName: 'Loja Exemplo',
  merchantCity: 'São Paulo',
  amount: 49.90,
});

console.log('Payload:', pixWithAmount.payload);
console.log('Válido:', validarPixPayload(pixWithAmount.payload));
console.log('Info:', pixWithAmount.info);
console.log('\n');

// ====================================
// EXEMPLO 3: Pix completo (com TXID)
// ====================================
console.log('📌 EXEMPLO 3: Pix completo com TXID');
const pixComplete = gerarPixCopiaCola({
  pixKey: '+5514998765432',
  merchantName: 'Restaurante Bom Sabor',
  merchantCity: 'Rio de Janeiro',
  amount: 159.90,
  txid: 'PEDIDO-2025-001',
  description: 'Mesa 5 - Almoço',
});

console.log('Payload:', pixComplete.payload);
console.log('Válido:', validarPixPayload(pixComplete.payload));
console.log('Info:', pixComplete.info);
console.log('\n');

// ====================================
// EXEMPLO 4: Pix com chave aleatória
// ====================================
console.log('📌 EXEMPLO 4: Pix com chave aleatória');
const pixRandom = gerarPixCopiaCola({
  pixKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  merchantName: 'Freelancer Dev',
  merchantCity: 'Brasília',
  amount: 500.00,
  txid: 'FREELANCE-JAN-2025',
});

console.log('Payload:', pixRandom.payload);
console.log('Válido:', validarPixPayload(pixRandom.payload));
console.log('Info:', pixRandom.info);
console.log('\n');

// ====================================
// EXEMPLO 5: Validação de payload
// ====================================
console.log('📌 EXEMPLO 5: Teste de validação');
const payloadValido = pixComplete.payload;
const payloadInvalido = payloadValido.slice(0, -4) + '0000'; // CRC errado

console.log('Payload válido:', validarPixPayload(payloadValido));
console.log('Payload inválido:', validarPixPayload(payloadInvalido));
console.log('\n');

// ====================================
// EXEMPLO 6: Uso em e-commerce
// ====================================
console.log('📌 EXEMPLO 6: Cenário de e-commerce');
const createCheckoutPix = (orderId: string, amount: number, customerEmail: string) => {
  return gerarPixCopiaCola({
    pixKey: 'vendas@loja.com.br',
    merchantName: 'LOJA ONLINE LTDA',
    merchantCity: 'SAO PAULO',
    amount: amount,
    txid: orderId,
    description: `Pedido para ${customerEmail}`,
  });
};

const checkoutPix = createCheckoutPix('ORD-12345', 299.99, 'cliente@email.com');
console.log('Pix gerado para checkout:');
console.log('- Payload:', checkoutPix.payload);
console.log('- Valor:', checkoutPix.info.amount);
console.log('- TXID:', checkoutPix.info.txid);
console.log('\n');

console.log('✅ Todos os exemplos executados com sucesso!');
console.log('\n💡 Dica: Copie qualquer payload acima e use no app do seu banco!');
