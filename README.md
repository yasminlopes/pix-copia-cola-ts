# Pix Copia e Cola - SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)]()

> Gerador de **Pix Copia e Cola** em TypeScript puro, sem dependências externas. Implementação completa do padrão EMV-Co do Banco Central do Brasil.

## Início Rápido

### Opção 1: Interface Web (Mais Fácil!)

1. **Configure sua chave Pix:**
   ```bash
   # Edite o arquivo public/config.js
   # Coloque sua chave Pix, nome e cidade
   ```

2. **Abra no navegador:**
   ```bash
   npm run demo
   ```

3. **Pronto!** Digite o valor e gere seu Pix 🎉

### Opção 2: Linha de Comando

```bash
# Rode os exemplos prontos
npm run example
```

---

## O que é?

Uma biblioteca que gera **códigos Pix** (aquele texto que você copia e cola no app do banco) seguindo o padrão oficial do Banco Central. 

**Funciona 100% no frontend** - não precisa de servidor ou API bancária!

### Características

- ✅ **Zero dependências** - código TypeScript puro
- ✅ **100% compatível** com padrão EMV-Co do Banco Central
- ✅ **Interface web incluída** - use sem programar
- ✅ **Totalmente testado** - cobertura de 100%
- ✅ **Pronto para produção** - validações completas

---

### Comandos Disponíveis

```bash
npm run demo          # Abre interface web no navegador
npm run example       # Roda exemplos em linha de comando
npm test              # Executa testes
npm run build         # Compila TypeScript
npm run test:coverage # Relatório de cobertura
```
---

## Exemplos Práticos

#### Pix com Valor Fixo

```typescript
const pixVenda = gerarPixCopiaCola({
  pixKey: 'vendas@loja.com.br',
  merchantName: 'Loja Exemplo',
  merchantCity: 'São Paulo',
  amount: 49.90,
});

console.log(pixVenda.info.amount); // "49.90"
```

#### Pix com TXID (Controle de Pedido)

```typescript
const pixPedido = gerarPixCopiaCola({
  pixKey: '+5514998765432',
  merchantName: 'Restaurante Bom Sabor',
  merchantCity: 'Rio de Janeiro',
  amount: 159.90,
  txid: 'PEDIDO-2025-001',
  description: 'Mesa 5 - Almoço',
});
```

#### Pix para Doação (Sem Valor)

```typescript
const pixDonation = gerarPixCopiaCola({
  pixKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  merchantName: 'ONG Exemplo',
  merchantCity: 'Brasília',
  description: 'Doe qualquer valor',
});
```

#### Validar Payload Existente

```typescript
import { validarPixPayload } from 'pix-copia-e-cola-ts';

const isValid = validarPixPayload(pix.payload);
console.log(isValid); // true
```

### API Completa

#### `gerarPixCopiaCola(config: PixConfig): PixPayload`

**Parâmetros:**

```typescript
interface PixConfig {
  pixKey: string;          // Chave Pix (obrigatório)
  merchantName: string;    // Nome do recebedor (obrigatório, máx. 25 chars)
  merchantCity: string;    // Cidade (obrigatório, máx. 15 chars)
  amount?: number;         // Valor da transação (opcional)
  txid?: string;           // ID da transação (opcional, máx. 25 chars)
  description?: string;    // Descrição adicional (opcional, máx. 72 chars)
}
```

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Ver cobertura
npm run test:coverage
```

**Resultado:** 34 testes passando, 100% de cobertura ✅

---

## ❓ Perguntas Frequentes
---

## 🏗️ Estrutura do Projeto

```
pix-copia-e-cola-ts/
├── src/
│   ├── pixCopiaCola.ts     # Implementação principal
│   └── index.ts            # Exports públicos
├── tests/
│   └── pixCopiaCola.test.ts # Testes unitários (Jest)
├── examples/
│   └── simpleExample.ts     # Exemplos de uso
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 🔬 Como Funciona (Técnico)

### Padrão EMV-Co

Todo campo segue a estrutura:

```
ID (2 dígitos) | TAMANHO (2 dígitos) | VALOR
```

**Exemplo:**
```
59 10 FULANO TEC
```

### Campos do Pix

| ID | Campo | Descrição |
|----|-------|-----------|
| 00 | Payload Format | Versão do payload (sempre "01") |
| 26 | Merchant Account | GUI + Chave Pix |
| 52 | Category | Categoria (sempre "0000") |
| 53 | Currency | Moeda (986 = BRL) |
| 54 | Amount | Valor da transação (opcional) |
| 58 | Country | País (BR) |
| 59 | Merchant Name | Nome do recebedor |
| 60 | Merchant City | Cidade |
| 62 | Additional Data | TXID e descrição |
| 63 | CRC16 | Checksum do payload |

### CRC16-CCITT

- **Polinômio:** 0x1021
- **Valor inicial:** 0xFFFF
- **Saída:** 4 caracteres hexadecimais MAIÚSCULOS
- **Cálculo:** Sobre todo o payload incluindo "6304"

**Algoritmo:**

```typescript
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

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
```

---

## 📝 Validações Automáticas

A biblioteca inclui validações completas:

- ✅ Chave Pix não vazia (máx. 77 chars)
- ✅ Nome normalizado (remove acentos, máx. 25 chars)
- ✅ Cidade normalizada (remove acentos, máx. 15 chars)
- ✅ Valor positivo (máx. 999.999.999,99)
- ✅ TXID válido (máx. 25 chars)
- ✅ Descrição válida (máx. 72 chars)
- ✅ CRC16 correto

---

## 🎯 Casos de Uso

### E-commerce

```typescript
function createCheckoutPix(orderId: string, amount: number) {
  return gerarPixCopiaCola({
    pixKey: 'vendas@loja.com.br',
    merchantName: 'LOJA ONLINE LTDA',
    merchantCity: 'SAO PAULO',
    amount: amount,
    txid: orderId,
  });
}
```

### Delivery

```typescript
function createDeliveryPix(pedido: Pedido) {
  return gerarPixCopiaCola({
    pixKey: '+5511987654321',
    merchantName: pedido.restaurante,
    merchantCity: pedido.cidade,
    amount: pedido.total,
    txid: `PED-${pedido.id}`,
    description: `Mesa ${pedido.mesa}`,
  });
}
```

### Freelancer

```typescript
function createInvoicePix(invoice: Invoice) {
  return gerarPixCopiaCola({
    pixKey: 'freelancer@email.com',
    merchantName: 'FREELANCER DEV',
    merchantCity: 'BRASILIA',
    amount: invoice.amount,
    txid: invoice.id,
    description: invoice.description,
  });
}
```

---

## 🚀 Scripts Disponíveis

```bash
npm run build          # Compila TypeScript para JavaScript
npm test               # Executa testes
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Gera relatório de cobertura
npm run lint           # Valida tipos TypeScript
npm run example        # Executa exemplos
```

---

## 🔒 Segurança

- ✅ **Sem API externa** - tudo roda localmente
- ✅ **Sem criptografia** - payload é apenas texto formatado
- ✅ **Sem dados sensíveis** - não armazena informações bancárias
- ✅ **Open source** - código auditável
- ✅ **Sem dependências** - zero riscos de supply chain

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎁 Vendendo Este Produto

### 💰 Como Monetizar

Este é um produto **pronto para vender**! Aqui estão algumas ideias:

#### 1️⃣ **Produto Digital (R$ 47-97)**
- Pacote completo com código-fonte
- Tutorial em vídeo de integração
- Suporte por 30 dias
- Atualizações vitalícias

#### 2️⃣ **SaaS (Software as a Service)**
- API hospedada na nuvem
- Planos: Free, Pro (R$ 29/mês), Business (R$ 99/mês)
- Dashboard de gerenciamento
- Análise de transações

#### 3️⃣ **Template/Boilerplate (R$ 27-47)**
- Venda como template pronto
- Inclua exemplos de integração
- Scripts de deploy automatizado

#### 4️⃣ **Consultoria/Implementação**
- Integração personalizada
- Treinamento de equipes
- Suporte técnico dedicado

### 📢 Onde Vender

- 🛒 **Gumroad** - produtos digitais
- 💳 **Hotmart** - infoprodutos
- 🌐 **CodeCanyon** - templates e scripts
- 🚀 **GitHub Sponsors** - open source com suporte pago
- 📱 **Seu próprio site** - 100% dos lucros

### 🎯 Público-Alvo

- 👨‍💻 Desenvolvedores freelancers
- 🏢 Agências de desenvolvimento
- 🛍️ Donos de e-commerce
- 📱 Startups de fintech
- 🍕 Proprietários de delivery

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Manual do Pix - Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix)
- [Especificação EMV-Co](https://www.emvco.com/)
- [Padrão BR Code](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_manual_usuario_BR_Code.pdf)

### Artigos Relacionados

- Como gerar QR Code a partir do payload
- Integração com gateways de pagamento
- Boas práticas de segurança com Pix

**P: Como configurar minha chave Pix?**  
R: Edite o arquivo `public/config.js` e coloque sua chave, nome e cidade.

**P: Funciona com qualquer banco?**  
R: Sim! Segue o padrão oficial do Banco Central.

**P: Preciso de servidor?**  
R: Não! Funciona 100% no navegador.

**P: Como usar em React/Vue/Angular?**  
R: Importe a função do `src/pixCopiaCola.ts` no seu projeto.

**P: É seguro?**  
R: Sim! Código open source, sem envio de dados externos.

---

## 📄 Licença

MIT - Use como quiser! Veja [LICENSE](LICENSE)

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças grandes, abra uma issue primeiro.

---

## 💰 Quer Vender Este Produto?

Veja o guia completo em [COMO_VENDER.md](COMO_VENDER.md) com:
- Estratégias de monetização
- Precificação sugerida
- Scripts de vendas
- Plataformas recomendadas

---

## 👨‍💻 Autor

**Yasmin Lopes**

---

<div align="center">

**Feito com ❤️ e TypeScript**

Se ajudou você, dê uma ⭐ no GitHub!

</div>
e projeto salvou seu dia, compartilhe com outros devs! 🚀

</div>
