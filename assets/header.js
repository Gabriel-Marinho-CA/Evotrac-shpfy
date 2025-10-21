class MenuMob extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.trigger_menu = document.querySelector(".trigger-side-bar");
    this.side_bar = this.trigger_menu.nextElementSibling;
    this.close_menu = this.side_bar.querySelector(".close-menu-mob");
    this.overlay = document.querySelector(".overlay");

    this.trigger_menu.addEventListener("click", () => this.handleMenuMob());
    this.close_menu.addEventListener("click", () =>
      this.handleMenuMob("close")
    );
    this.overlay.addEventListener("click", () => this.handleMenuMob("close"));
  }

  handleMenuMob(action = "open") {
    if (action == "close") {
      this.side_bar.classList.remove("active");
      this.overlay.classList.remove("active");
    } else {
      this.side_bar.classList.add("active");
      this.overlay.classList.add("active");
    }
  }
}

customElements.define("menu-mob", MenuMob);
