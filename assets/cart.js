class CartService {
  constructor() {
    this.currentController = null;
  }

  async addToCart(product_id) {
    const config = fetchConfig("javascript");

    const productObj = {
      items: [
        {
          id: product_id,
          quantity: 1,
        },
      ],
    };

    config.body = JSON.stringify(productObj);

    try {
      const request = await fetch(`${routes.cart_add_url}`, {
        ...config,
        signal: this._setupRequest(),
      });

      if (request.ok) {
        this.cartUpdate();
      }
    } catch (error) {
      console.error("Error in addToCart", error.message);
    }
  }
async cartUpdate() {
  try {
    const isCartPage = this.isOnCartPage();
    const sectionToFetch = isCartPage ? "main-cart" : "cart-drawer";

    const request = await fetch(
      `${routes.cart_url}?section_id=${sectionToFetch}`,
      { signal: this._setupRequest() }
    );

    if (!request.ok) return;

    const htmlString = await request.text();

    // Publica para onde está
    if (isCartPage) {
      publish(PUB_SUB_EVENTS.cartPageUpdateUi, { responseText: htmlString });
    } else {
      publish(PUB_SUB_EVENTS.cartUpdateUi, { responseText: htmlString });
    }

    // 🌟 E AQUI está o hack: atualiza o outro contexto usando a mesma resposta
    publish(PUB_SUB_EVENTS.syncOtherContext, {
      responseText: htmlString,
      source: sectionToFetch,
    });

  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error in cartUpdate", error.message);
    }
  }
}

  async updateQuantity(line_id, qtd) {
    const body = JSON.stringify({
      id: line_id,
      quantity: qtd,
    });

    try {
      const request = await fetch(`${routes.cart_change_url}`, {
        ...fetchConfig(),
        signal: this._setupRequest(),
        ...{ body },
      });
      if (request.ok) {
        this.cartUpdate();
      }
    } catch (error) {
      console.error("Error in updateQuantity", error.message);
    }
  }
  async removeItem(line_id) {
    const body = JSON.stringify({
      id: line_id,
      quantity: 0,
    });

    try {
      const request = await fetch(`${routes.cart_change_url}`, {
        ...fetchConfig(),
        signal: this._setupRequest(),
        ...{ body },
      });
      if (request.ok) {
        this.cartUpdate();
      }
    } catch (error) {
      console.error("Error in removeItem", error.message);
    }
  }

  _setupRequest() {
    if (this.currentController) this.currentController.abort();
    this.currentController = new AbortController();
    return this.currentController.signal;
  }
}

class CartUI {
  constructor() {
    subscribe(PUB_SUB_EVENTS.syncOtherContext, this.syncOtherContext.bind(this));
    subscribe(PUB_SUB_EVENTS.cartUpdateUi, this.updateUI.bind(this));
    subscribe(PUB_SUB_EVENTS.cartPageUpdateUi, this.updateUICartPage.bind(this));
  }
    syncOtherContext({ responseText, source }) {
      const html = new DOMParser().parseFromString(responseText, "text/html");

      if (source === "main-cart") {
        // estamos na página → atualizar minicart se o elemento existir
        const drawer = html.querySelector("#CartDrawer");
        const target = document.querySelector("#CartDrawer");
        if (drawer && target) target.replaceWith(drawer);

      } else if (source === "cart-drawer") {
        // estamos fora da página → atualizar cart page apenas se o elemento existir
        const cart = html.querySelector("#cart-template");
        const target = document.querySelector("#cart-template");
        if (cart && target) target.replaceWith(cart);
      }

      // Atualiza badge
      const qty = html.querySelector(".buble-quantity")?.innerText;
      if (qty) this.updateQuantityBubble(qty);
    }
  updateUI(data) {
    const html = new DOMParser().parseFromString(
      data.responseText,
      "text/html"
    );

    const quantity_cart = html.querySelector(
      "#CartDrawer .buble-quantity"
    ).innerText;

    this.updateQuantityBubble(quantity_cart);

    const selectors = ["#CartDrawer"];

    for (const selector of selectors) {
      const targetElement = document.querySelector(selector);
      const sourceElement = html.querySelector(selector);
      if (targetElement && sourceElement) {
        targetElement.replaceWith(sourceElement);
      }
    }

    // = html.querySelector("#CartDrawer .buble-quantity").innerText;
  }

  updateUICartPage(data) {
    const html = new DOMParser().parseFromString(
      data.responseText,
      "text/html"
    );

    const replaceSelectors = ["#cart-template", ".cart-totals", ".cart-items"];

    for (const selector of replaceSelectors) {
      const target = document.querySelector(selector);
      const source = html.querySelector(selector);
      if (target && source) {
        target.replaceWith(source);
      }
    }

    // Atualiza badge
    const quantity = html.querySelector(".buble-quantity")?.innerText;
    if (quantity) this.updateQuantityBubble(quantity);
  }

  updateQuantityBubble(quantity_value) {
    document.querySelector(".cart-count-span").innerText = quantity_value;
  }
}

const cartService = new CartService();
window.cartService = cartService;

const cartUI = new CartUI();
