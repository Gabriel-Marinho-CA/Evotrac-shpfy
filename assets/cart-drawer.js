class CartDrawerControls {
  constructor() {
    this.minicart = document.querySelector("cart-drawer");
    this.element_open_minicart = document.querySelector('.minicart');
    this.element_close_minicart = document.querySelector('close-minicart');
    this.overlay = document.querySelector(".overlay");

    this.element_open_minicart.addEventListener('click', this.openMinicart.bind(this));
    this.element_close_minicart.addEventListener('click', this.closeMinicart.bind(this));
    this.overlay.addEventListener('click', this.closeMinicart.bind(this));  
    
  }
  
  openMinicart() {
    this.minicart.classList.add("active");
    this.overlay.classList.add('active') 
  }
  closeMinicart() {
    this.minicart.classList.remove("active");
    this.overlay.classList.remove('active') 
  }
}

class CloseDrawer extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("close-minicart", CloseDrawer);


let cartDrawerControls;
window.addEventListener('load', () => {
   cartDrawerControls = new CartDrawerControls();
});

