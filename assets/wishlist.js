class WishlistButton extends HTMLButtonElement {
  constructor() {
    super();
    this.handle = this.dataset.productHandle;
    this.wishlistStorage = "";

    this.addEventListener("click", () => {
      this.handleStoreWishList();
    });
  }

  connectedCallback() {
    this.wishlistStorage = localStorage.getItem("wishlist");
    this.updateWishlistUI();
  }

  handleStoreWishList() {
    let wishListStorage = localStorage.getItem("wishlist");

    if (
      !wishListStorage ||
      wishListStorage === "[]" ||
      wishListStorage === "{}"
    ) {
      wishListStorage = "[]";
    }
    const currentArrayWishList = JSON.parse(wishListStorage);

    const index = currentArrayWishList.indexOf(this.handle);
    if (index === -1) {
      currentArrayWishList.push(this.handle);
      this.setAttribute("data-wishlist", "true");
    } else {
      currentArrayWishList.splice(index, 1);
      this.setAttribute("data-wishlist", "false");
    }

    localStorage.setItem("wishlist", JSON.stringify(currentArrayWishList));
  }

  updateWishlistUI() {
    if (!this.wishlistStorage) return;

    const wishlist = JSON.parse(this.wishlistStorage);

    if (wishlist.includes(this.handle)) {
      this.setAttribute("data-wishlist", "true");
    } else {
      this.setAttribute("data-wishlist", "false");
    }
  }
}
customElements.define("wishlist-btn", WishlistButton, {
  extends: "button",
});


class WishlistList extends HTMLElement {
  constructor() {
    super();
    this.wishlist = [];
    this.container = null;
  }

  connectedCallback() {
    console.log("ola")
    this.innerHTML = `
      <div class="wishlist-wrapper">
        <div class="wishlist-items"></div>
        <p class="wishlist-empty" style="display:none;">Nenhum produto na lista :(</p>
      </div>
    `;

    this.container = this.querySelector(".wishlist-items");
    this.emptyMessage = this.querySelector(".wishlist-empty");

    this.loadWishlist();
  }

  loadWishlist() {
    const stored = localStorage.getItem("wishlist");

    if (!stored || stored === "[]" || stored === "{}") {
      this.showEmpty();
      return;
    }

    try {
      this.wishlist = JSON.parse(stored);
    } catch (e) {
      console.error("Erro ao ler wishlist:", e);
      this.showEmpty();
      return;
    }

    if (!Array.isArray(this.wishlist) || this.wishlist.length === 0) {
      this.showEmpty();
      return;
    }

    this.renderProducts();
  }

  async renderProducts() {
    this.container.innerHTML = "";

    for (const handle of this.wishlist) {
      try {
        const produto = await this.fetchProduct(handle);
        const card = this.createProductCard(produto);
        this.container.appendChild(card);
      } catch (e) {
        console.error("Erro ao carregar produto", handle, e);
      }
    }
  }

  async fetchProduct(handle) {
    const url = `/products/${handle}.js`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Produto não encontrado: " + handle);
    return await res.json();
  }

  createProductCard(prod) {
    const div = document.createElement("div");
    div.classList.add("wishlist-card");

    div.innerHTML = `
      <div class="wishlist-card-img">
        <img src="${prod.featured_image}" alt="${prod.title}">
      </div>

      <div class="wishlist-card-info">
        <h3>${prod.title}</h3>
        <p class="wishlist-card-price">
          ${this.formatPrice(prod.price)}
        </p>

        <a href="${prod.url}" class="wishlist-card-btn">Ver produto</a>
      </div>
    `;

    return div;
  }

  formatPrice(cents) {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  showEmpty() {
    this.container.innerHTML = "";
    if (this.emptyMessage) this.emptyMessage.style.display = "block";
  }
}

customElements.define("wishlist-list", WishlistList);
