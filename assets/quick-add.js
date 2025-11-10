class AddToCart extends HTMLButtonElement {
  constructor() {
    super();
    this.product_id = parseInt(this.getAttribute("data-product-id"));
    this.addEventListener("click", async () => {
      await window.cartService.addToCart(this.product_id);
      setTimeout(() => {
        window.cartDrawerControls.openDrawer();
      }, ON_CHANGE_DEBOUNCE_TIMER);
    });
  }
}
customElements.define("add-to-cart", AddToCart, {
  extends: "button",
});


class AddToCartMultiple extends HTMLButtonElement {
  constructor() {
    super();

    const productAttr = this.getAttribute("data-product-id");
    this.product_ids = productAttr
      .split(",")
      .map(id => id.trim())
      .filter(Boolean)
      .map(Number);

    this.addEventListener("click", async () => {
      for (const id of this.product_ids) {
        await window.cartService.addToCart(id);
      }
      setTimeout(() => {
        window.cartDrawerControls.openDrawer();
      }, ON_CHANGE_DEBOUNCE_TIMER);
    });
  }
}

customElements.define("add-to-cart-multiple", AddToCartMultiple, {
  extends: "button",
});
