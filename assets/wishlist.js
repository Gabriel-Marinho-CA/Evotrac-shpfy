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
