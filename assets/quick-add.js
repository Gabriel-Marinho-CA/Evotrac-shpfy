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
