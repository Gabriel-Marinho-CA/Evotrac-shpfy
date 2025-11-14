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
    const urls = [
      `${routes.cart_url}?section_id=main-cart`,
      `${routes.cart_url}?section_id=cart-drawer`,
    ];

    try {
      if (this.isOnCartPage()) {
        const [mainRes, drawerRes] = await Promise.all(
          urls.map((url) => fetch(url))
        );

        if (mainRes.ok && drawerRes.ok) {
          const [mainHtml, drawerHtml] = await Promise.all([
            mainRes.text(),
            drawerRes.text(),
          ]);

          publish(PUB_SUB_EVENTS.cartPageUpdateUi, {
            responseText: mainHtml,
          });

          publish(PUB_SUB_EVENTS.cartUpdateUi, {
            responseText: drawerHtml,
          });
        }
      } else {
        const request = await fetch(urls[1]);
        if (request.ok) {
          const responseText = await request.text();
          publish(PUB_SUB_EVENTS.cartUpdateUi, { responseText });
        }
      }
    } catch (error) {
      console.error("Error in cartUpdate", error.message);
    }
  }
  isOnCartPage() {
    return window.location.pathname === routes.cart_url;
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
    subscribe(
      PUB_SUB_EVENTS.cartPageUpdateUi,
      this.cartPageUpdateUi.bind(this)
    );
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

    const selector = "#CartDrawer";
    const targetElement = document.querySelector(selector);
    const sourceElement = html.querySelector(selector);
    if (targetElement && sourceElement) {
      targetElement.replaceWith(sourceElement);
    }

    // = html.querySelector("#CartDrawer .buble-quantity").innerText;
  }

  cartPageUpdateUi(data) {
    const html = new DOMParser().parseFromString(
      data.responseText,
      "text/html"
    );
    const cartPageElement = document.querySelector("#cart-template");
    const sourceElement = html.querySelector("#cart-template");
    if (cartPageElement && sourceElement) {
      cartPageElement.replaceWith(sourceElement);
    }
  }
  updateQuantityBubble(quantity_value) {
    document.querySelector(".cart-count-span").innerText = quantity_value;
  }
}

const cartService = new CartService();
window.cartService = cartService;

const cartUI = new CartUI();
