class CartPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
  }
}

customElements.define("cart-page", CartPage);

class CartItem extends HTMLElement {
  connectedCallback() {
    this.lineId = this.dataset.lineItemKey;

    this.minusBtn = this.querySelector("[data-minus]");
    this.plusBtn = this.querySelector("[data-plus]");
    this.qtyInput = this.querySelector("[data-qty-input]");
    this.removeBtn = this.querySelector("[data-remove]");

    console.log(this.lineId);

    if (this.minusBtn)
      this.minusBtn.addEventListener("click", () => this._change(-1));

    if (this.plusBtn)
      this.plusBtn.addEventListener("click", () => this._change(1));

    if (this.qtyInput)
      this.qtyInput.addEventListener("change", () =>
        cartService.updateQuantity(this.lineId, parseInt(this.qtyInput.value))
      );

    if (this.removeBtn)
      this.removeBtn.addEventListener("click", () =>
        cartService.removeItem(this.lineId)
      );
  }

  _change(delta) {
    const newQty = parseInt(this.qtyInput.value) + delta;
    if (newQty <= 0) return;
    cartService.updateQuantity(this.lineId, newQty);
  }
}

customElements.define("cart-item", CartItem);

class CartRemove extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", () => {
      const id = this.dataset.removeItemId;
      cartService.removeItem(id);
    });
  }
}
customElements.define("cart-remove", CartRemove);

class CartQty extends HTMLElement {
  connectedCallback() {
    this.lineId = this.dataset.lineItemKey;

    this.minus = this.querySelector("[data-minus]");
    this.plus = this.querySelector("[data-plus]");
    this.input = this.querySelector("[data-qty-input]");

    this.minus.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._update(-1);
    });
    this.plus.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._update(1);
    });

    this.input.addEventListener("change", () =>
      cartService.updateQuantity(this.lineId, parseInt(this.input.value))
    );
  }

  _update(delta) {
    const newValue = parseInt(this.input.value) + delta;
    cartService.updateQuantity(this.lineId, newValue);
  }
}

customElements.define("cart-qty", CartQty);

