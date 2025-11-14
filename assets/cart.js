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
      const request = await fetch(`${routes.cart_url}?section_id=cart-drawer`);

      if (request.ok) {
        const responseText = await request.text();
        publish(PUB_SUB_EVENTS.cartUpdateUi, { responseText: responseText });
      }
    } catch (error) {
      console.error("Error in cartUpdate", error.message);
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
    subscribe(PUB_SUB_EVENTS.cartUpdateUi, this.updateUI.bind(this));
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

  updateQuantityBubble(quantity_value) {
    document.querySelector(".cart-count-span").innerText = quantity_value;
  }
}

const cartService = new CartService();
window.cartService = cartService;

const cartUI = new CartUI();


