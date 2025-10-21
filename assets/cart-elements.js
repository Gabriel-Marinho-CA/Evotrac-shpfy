class CartDrawerControls {
  constructor() {
    this.minicart = document.querySelector("cart-drawer");
    this.overlay = document.querySelector(".overlay");
  }

  openDrawer() {
    this.minicart.classList.add("active");
    this.overlay.classList.add("active");
  }
  closeDrawer() {
    this.minicart.classList.remove("active");
    this.overlay.classList.remove("active");
  }
}

class openDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", () =>
      window.cartDrawerControls.openDrawer()
    );
  }
}

customElements.define("open-drawer", openDrawer);

class CloseDrawer extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", () =>
      window.cartDrawerControls.closeDrawer()
    );
  }
}

customElements.define("close-drawer", CloseDrawer);

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.line_id = this.dataset.removeItemId;

    this.addEventListener("click", () =>
      window.cartService.removeItem(this.line_id)
    );
  }
}
customElements.define("cart-remove-item", CartRemoveButton);

class QuantityPopOver extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.input = this.querySelector("input");
    if (!this.input) return;
    this.line_id = this.input.dataset.quantityVariantId;
    this.decrease_button = this.querySelector(".minus");
    this.increase_button = this.querySelector(".plus");
    this.current_quantity = parseInt(this.input.value);

    this.decrease_button.addEventListener("click", () => {
      window.cartService.updateQuantity(
        this.line_id,
        this.current_quantity - 1
      );
    });
    this.increase_button.addEventListener("click", () => {
      window.cartService.updateQuantity(
        this.line_id,
        this.current_quantity + 1
      );
    });
  }
}
customElements.define("quantity-popover", QuantityPopOver);



const cartDrawerControls = new CartDrawerControls();
window.cartDrawerControls = cartDrawerControls;