class ShippingCalculator extends HTMLElement {
  constructor() {
    super();
    this.calculatedCep = '';
    this.calculatingCep = false;
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    // Estrutura mínima do componente

    this.zipInput = this.querySelector('.js-zip');
    this.button = this.querySelector('.js-button');
    this.responseContainer = this.querySelector('.shipping__response');
    this.form = this.querySelector('.shipping__form');

    // Eventos
    this.zipInput.addEventListener('input', this.formatCep.bind(this));
    this.zipInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.handleZipCode();
    });
    this.button.addEventListener('click', () => this.handleZipCode());
  }

  formatCep(e) {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length > 5) cep = cep.slice(0, 5) + '-' + cep.slice(5, 8);
    e.target.value = cep.slice(0, 9);
  }

  async handleZipCode() {
    if (this.calculatingCep) return;
    const cep = this.zipInput.value;

    if (this.calculatedCep === cep) return;
    this.calculatingCep = true;

    await this.checkZip(cep);
    this.calculatedCep = cep;
    this.calculatingCep = false;
  }

  async checkZip(zip) {
    this.renderResponse('');
    this.showLoading(true);

    const zipSemHifen = zip.replace('-', '');
    if (!zipSemHifen || zipSemHifen.length !== 8) {
      this.showLoading(false);
      this.renderResponse('Digite um CEP válido.');
      return;
    }

    const cart = await this.getCart();

    if (cart.item_count === 0) {
      const variant = document.querySelector('input[name=variant_id]');
      if (variant) {
        await this.addItemCart(variant.value);
        this.getShippingRates(zipSemHifen, true);
      } else {
        this.showLoading(false);
        this.renderResponse('Produto não encontrado.');
      }
    } else {
      this.getShippingRates(zipSemHifen, false);
    }
  }

  async getCart() {
    try {
      const res = await fetch('/cart.json');
      return res.ok ? res.json() : { item_count: 0 };
    } catch {
      return { item_count: 0 };
    }
  }

  async addItemCart(variantId) {
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getZip(zip) {
    try {
      const res = await fetch(`//viacep.com.br/ws/${zip}/json`);
      if (!res.ok) throw new Error();
      const info = await res.json();
      info.state = this.translateUF(info.uf);
      return info;
    } catch {
      return null;
    }
  }

  translateUF(uf) {
    const estados = {
      AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia',
      CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
      MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
      MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
      PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
      RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
      SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins'
    };
    return estados[uf] || 'Estado não encontrado';
  }

  async getShippingRates(zip, clear) {
    const zipInfo = await this.getZip(zip);
    if (!zipInfo) {
      this.showLoading(false);
      this.renderResponse('CEP não encontrado.');
      return;
    }

    try {
      const url = `/cart/shipping_rates.json?shipping_address[zip]=${zipInfo.cep}&shipping_address[country]=Brazil&shipping_address[province]=${zipInfo.state}`;
      const res = await fetch(url);
      const data = await res.json();
      this.renderShippingRates(data.shipping_rates);
      if (clear) await fetch('/cart/clear.js', {});
    } catch {
      this.showLoading(false);
      this.renderResponse('Erro ao buscar as taxas de envio.');
    }
  }

  showLoading(on) {
    this.responseContainer.classList.toggle('loading', on);
    this.button.disabled = on;
  }

  renderShippingRates(rates) {
    this.showLoading(false);
    if (!rates?.length) {
      this.renderResponse('Não entregamos para esse endereço.');
      return;
    }

    const list = document.createElement('ul');
    list.classList.add('response__rates');

    list.innerHTML = rates
      .map(
        (r) => `
        <li>
          <span>${r.name} - <strong>${
            Number(r.price) > 0
              ? this.formatPrice(Number(r.price))
              : 'GRÁTIS'
          }</strong></span>
          ${
            r.delivery_days?.length
              ? `<span>Entrega em ${r.delivery_days[0]} dia(s) útil(eis)</span>`
              : ''
          }
        </li>`
      )
      .join('');

    this.responseContainer.innerHTML = '';
    this.responseContainer.appendChild(list);
  }

  renderResponse(msg) {
    this.responseContainer.innerHTML = msg;
  }

  formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }
}

customElements.define('shipping-calculator', ShippingCalculator);