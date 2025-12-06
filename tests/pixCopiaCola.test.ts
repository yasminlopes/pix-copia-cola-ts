import { gerarPixCopiaCola, validarPixPayload } from '../src/pixCopiaCola';

describe('Pix Copia e Cola', () => {
  describe('gerarPixCopiaCola', () => {
    it('deve gerar payload básico sem valor', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload).toBeDefined();
      expect(pix.payload).toContain('000201'); // Payload format
      expect(pix.payload).toContain('BR.GOV.BCB.PIX');
      expect(pix.payload).toContain('12345678900');
      expect(pix.qrCode).toBe(pix.payload);
    });

    it('deve gerar payload com valor', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
        amount: 49.90,
      });

      expect(pix.payload).toContain('540549.90'); // ID 54 + tamanho 05 + valor
      expect(pix.info.amount).toBe('49.90');
    });

    it('deve gerar payload com TXID', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
        txid: 'PEDIDO123',
      });

      expect(pix.payload).toContain('PEDIDO123');
      expect(pix.info.txid).toBe('PEDIDO123');
    });

    it('deve gerar payload completo com todos os campos', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
        amount: 99.50,
        txid: 'ABC123',
        description: 'Pagamento teste',
      });

      expect(pix.payload).toBeDefined();
      expect(pix.info.pixKey).toBe('12345678900');
      expect(pix.info.merchantName).toBe('FULANO TEC');
      expect(pix.info.merchantCity).toBe('MARILIA');
      expect(pix.info.amount).toBe('99.50');
      expect(pix.info.txid).toBe('ABC123');
    });

    it('deve normalizar nome com acentos', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'José da Silva',
        merchantCity: 'São Paulo',
      });

      expect(pix.info.merchantName).toBe('JOSE DA SILVA');
      expect(pix.info.merchantCity).toBe('SAO PAULO');
    });

    it('deve truncar nome muito longo', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'NOME MUITO MUITO MUITO LONGO QUE PRECISA SER TRUNCADO',
        merchantCity: 'MARILIA',
      });

      expect(pix.info.merchantName.length).toBeLessThanOrEqual(25);
    });

    it('deve truncar cidade muito longa', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'CIDADE COM NOME MUITO LONGO',
      });

      expect(pix.info.merchantCity.length).toBeLessThanOrEqual(15);
    });

    it('deve formatar valor com 2 casas decimais', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
        amount: 10,
      });

      expect(pix.info.amount).toBe('10.00');
    });

    it('deve aceitar chave Pix aleatória', () => {
      const pix = gerarPixCopiaCola({
        pixKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.info.pixKey).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    });

    it('deve aceitar email como chave Pix', () => {
      const pix = gerarPixCopiaCola({
        pixKey: 'contato@FULANO.com.br',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.info.pixKey).toBe('contato@FULANO.com.br');
    });

    it('deve aceitar telefone como chave Pix', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '+5514998765432',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.info.pixKey).toBe('+5514998765432');
    });
  });

  describe('Validações', () => {
    it('deve rejeitar chave Pix vazia', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '',
          merchantName: 'FULANO TEC',
          merchantCity: 'MARILIA',
        });
      }).toThrow('Chave Pix não pode ser vazia');
    });

    it('deve rejeitar chave Pix muito longa', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: 'a'.repeat(78),
          merchantName: 'FULANO TEC',
          merchantCity: 'MARILIA',
        });
      }).toThrow('Chave Pix muito longa');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '12345678900',
          merchantName: '!!!',
          merchantCity: 'MARILIA',
        });
      }).toThrow('Nome do recebedor inválido');
    });

    it('deve rejeitar cidade vazia', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '12345678900',
          merchantName: 'FULANO TEC',
          merchantCity: '!!!',
        });
      }).toThrow('Cidade inválida');
    });

    it('deve rejeitar valor zero', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '12345678900',
          merchantName: 'FULANO TEC',
          merchantCity: 'MARILIA',
          amount: 0,
        });
      }).toThrow('Valor deve ser maior que zero');
    });

    it('deve rejeitar valor negativo', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '12345678900',
          merchantName: 'FULANO TEC',
          merchantCity: 'MARILIA',
          amount: -10,
        });
      }).toThrow('Valor deve ser maior que zero');
    });

    it('deve rejeitar valor muito alto', () => {
      expect(() => {
        gerarPixCopiaCola({
          pixKey: '12345678900',
          merchantName: 'FULANO TEC',
          merchantCity: 'MARILIA',
          amount: 1000000000,
        });
      }).toThrow('Valor muito alto');
    });
  });

  describe('CRC16', () => {
    it('deve incluir CRC16 válido no final do payload', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      // CRC deve ter 4 caracteres hexadecimais
      const crc = pix.payload.slice(-4);
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
    });

    it('deve calcular CRC diferente para payloads diferentes', () => {
      const pix1 = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      const pix2 = gerarPixCopiaCola({
        pixKey: '98765432100',
        merchantName: 'OUTRA EMPRESA',
        merchantCity: 'SAO PAULO',
      });

      const crc1 = pix1.payload.slice(-4);
      const crc2 = pix2.payload.slice(-4);

      expect(crc1).not.toBe(crc2);
    });
  });

  describe('validarPixPayload', () => {
    it('deve validar payload correto', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(validarPixPayload(pix.payload)).toBe(true);
    });

    it('deve rejeitar payload muito curto', () => {
      expect(validarPixPayload('00020126')).toBe(false);
    });

    it('deve rejeitar payload sem formato correto', () => {
      expect(validarPixPayload('999999' + 'a'.repeat(100))).toBe(false);
    });

    it('deve rejeitar payload com CRC inválido', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      const invalidPayload = pix.payload.slice(0, -4) + '0000';
      expect(validarPixPayload(invalidPayload)).toBe(false);
    });

    it('deve rejeitar payload com CRC não-hexadecimal', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      const invalidPayload = pix.payload.slice(0, -4) + 'GGGG';
      expect(validarPixPayload(invalidPayload)).toBe(false);
    });

    it('deve rejeitar string vazia', () => {
      expect(validarPixPayload('')).toBe(false);
    });
  });

  describe('Formato EMV', () => {
    it('deve começar com Payload Format Indicator', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload.startsWith('000201')).toBe(true);
    });

    it('deve conter GUI do Pix', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload).toContain('0014BR.GOV.BCB.PIX');
    });

    it('deve conter categoria 0000', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload).toContain('52040000');
    });

    it('deve conter moeda BRL (986)', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload).toContain('5303986');
    });

    it('deve conter país BR', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'FULANO TEC',
        merchantCity: 'MARILIA',
      });

      expect(pix.payload).toContain('5802BR');
    });
  });

  describe('Casos de uso reais', () => {
    it('deve gerar Pix para venda de produto', () => {
      const pix = gerarPixCopiaCola({
        pixKey: 'vendas@loja.com.br',
        merchantName: 'LOJA EXEMPLO',
        merchantCity: 'SAO PAULO',
        amount: 159.90,
        txid: 'VENDA-2025-001',
        description: 'Produto XYZ',
      });

      expect(pix.payload).toBeDefined();
      expect(pix.info.amount).toBe('159.90');
      expect(validarPixPayload(pix.payload)).toBe(true);
    });

    it('deve gerar Pix para doação', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '12345678900',
        merchantName: 'ONG EXEMPLO',
        merchantCity: 'RIO DE JANEIRO',
        description: 'Doe qualquer valor',
      });

      expect(pix.payload).toBeDefined();
      expect(pix.info.amount).toBeUndefined();
      expect(validarPixPayload(pix.payload)).toBe(true);
    });

    it('deve gerar Pix para cobrança mensal', () => {
      const pix = gerarPixCopiaCola({
        pixKey: '+5511987654321',
        merchantName: 'CONDOMINIO ABC',
        merchantCity: 'BRASILIA',
        amount: 450.00,
        txid: 'COND-DEZ-2025',
      });

      expect(pix.payload).toBeDefined();
      expect(pix.info.amount).toBe('450.00');
      expect(validarPixPayload(pix.payload)).toBe(true);
    });
  });
});
