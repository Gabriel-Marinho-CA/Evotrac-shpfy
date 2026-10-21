(function () {
  if (window.evotracWishlistInitialized) return;
  window.evotracWishlistInitialized = true;

  const selector = 'button[is="wishlist-btn"]';

  function readWishlist() {
    const value = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    if (!Array.isArray(value)) {
      throw new Error("Formato inválido da lista de favoritos.");
    }

    return value;
  }

  function updateButtons() {
    let wishlist;

    try {
      wishlist = readWishlist();
    } catch (error) {
      console.error("Não foi possível ler os favoritos:", error);
      return;
    }

    document.querySelectorAll(selector).forEach(function (button) {
      const selected = wishlist.includes(
        button.dataset.productHandle
      );

      button.type = "button";
      button.setAttribute("data-wishlist", String(selected));
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute(
        "aria-label",
        selected
          ? "Remover da lista de favoritos"
          : "Adicionar à lista de favoritos"
      );
    });
  }

  document.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest(selector);
    if (!button) return;

    event.preventDefault();

    const handle = button.dataset.productHandle;
    if (!handle) return;

    try {
      const wishlist = readWishlist();
      const index = wishlist.indexOf(handle);

      if (index === -1) {
        wishlist.push(handle);
      } else {
        wishlist.splice(index, 1);
      }

      localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
      );

      updateButtons();
    } catch (error) {
      console.error("Não foi possível salvar os favoritos:", error);
      window.alert(
        "Não foi possível atualizar seus favoritos neste navegador. Tente novamente."
      );
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateButtons);
  } else {
    updateButtons();
  }

  document.addEventListener("shopify:section:load", updateButtons);

  window.addEventListener("storage", function (event) {
    if (event.key === "wishlist") updateButtons();
  });
})();
