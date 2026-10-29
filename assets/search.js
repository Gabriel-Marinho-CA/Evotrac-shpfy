class SearchFilters extends HTMLElement {
  constructor() {
    super();

    this.form = null;
    this.applyButton = null;
    this.filtersAside = null;
    this.sortSelects = [];
    this.filterHiddenElements = new Map();
    this.initialized = false;
  }

  connectedCallback() {
    if (this.initialized) return;

    this.initialize();
  }

  initialize() {
    this.form = document.getElementById("formFilter");
    this.applyButton = document.getElementById("apply-filter");
    this.filtersAside = document.querySelector(".filters-aside");

    this.sortSelects = document.querySelectorAll(
      ".wrapper-select-sort-by select"
    );

    if (!this.form) return;

    this.initialized = true;

    this.bindSortSelects();
    this.bindFormSubmit();
    this.bindResponsiveBehavior();
    this.bindApplyButton();
  }

  bindSortSelects() {
    this.sortSelects.forEach((select) => {
      select.addEventListener("change", (event) => {
        this.redirectUserOrderBy(event.target.value);
      });
    });
  }

  redirectUserOrderBy(value) {
    const url = new URL(window.location.href);

    url.searchParams.set("sort_by", value);
    url.searchParams.delete("page");

    window.location.assign(url.toString());
  }

  bindFormSubmit() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const minInput = this.form.querySelector(
      '[name="filter.v.price.gte"]'
    );

    const maxInput = this.form.querySelector(
      '[name="filter.v.price.lte"]'
    );

    if (minInput) {
      minInput.setCustomValidity("");
    }

    if (maxInput) {
      maxInput.setCustomValidity("");
    }

    const hasMin = minInput && minInput.value !== "";
    const hasMax = maxInput && maxInput.value !== "";

    if (
      hasMin &&
      hasMax &&
      Number.isFinite(minInput.valueAsNumber) &&
      Number.isFinite(maxInput.valueAsNumber) &&
      minInput.valueAsNumber > maxInput.valueAsNumber
    ) {
      maxInput.setCustomValidity(
        "O preço máximo deve ser maior ou igual ao preço mínimo."
      );
    }

    if (!this.form.reportValidity()) return;

    const url = new URL(window.location.href);

    // Remove os filtros anteriores, preservando busca e ordenação.
    const existingKeys = Array.from(url.searchParams.keys());

    existingKeys.forEach((key) => {
      if (key.startsWith("filter.")) {
        url.searchParams.delete(key);
      }
    });

    // Volta à primeira página ao alterar os filtros.
    url.searchParams.delete("page");

    const formData = new FormData(this.form);

    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("filter.")) continue;

      const text = String(value).trim();

      // Campos vazios não impõem limites.
      if (text === "") continue;

      if (
        key === "filter.v.price.gte" ||
        key === "filter.v.price.lte"
      ) {
        const input =
          key === "filter.v.price.gte" ? minInput : maxInput;

        const amount = input ? input.valueAsNumber : NaN;

        if (!Number.isFinite(amount) || amount < 0) continue;

        // Os campos já estão em reais.
        // Envia somente o número, sem R$ ou separadores de milhar.
        url.searchParams.append(key, amount.toFixed(2));
      } else {
        url.searchParams.append(key, text);
      }
    }

    window.location.assign(url.toString());
  }

  bindResponsiveBehavior() {
    const inputs = this.form.querySelectorAll("input");

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const priceInputs = this.form.querySelectorAll(
          '[name="filter.v.price.gte"], [name="filter.v.price.lte"]'
        );

        priceInputs.forEach((priceInput) => {
          priceInput.setCustomValidity("");
        });
      });

      input.addEventListener("change", () => {
        if (window.innerWidth > 1024) {
          this.form.requestSubmit();
        }
      });
    });

    const toggleElements = document.querySelectorAll(
      ".wrap-sortby h3, .filters-top button"
    );

    toggleElements.forEach((element) => {
      element.addEventListener("click", (event) => {
        if (window.innerWidth <= 1024) {
          event.preventDefault();
          this.toggleFilters();
        }
      });
    });
  }

  toggleFilters() {
    if (!this.filtersAside) return;

    const isOpen = this.filtersAside.classList.toggle("active");

    if (isOpen) {
      this.filterHiddenElements.clear();

      document
        .querySelectorAll("shopify-chat, .wishlist-heart")
        .forEach((element) => {
          this.filterHiddenElements.set(element, {
            value: element.style.getPropertyValue("display"),
            priority: element.style.getPropertyPriority("display"),
          });

          element.style.setProperty("display", "none", "important");
        });
    } else {
      this.restoreHiddenElements();
    }
  }

  restoreHiddenElements() {
    this.filterHiddenElements.forEach((original, element) => {
      if (original.value) {
        element.style.setProperty(
          "display",
          original.value,
          original.priority
        );
      } else {
        element.style.removeProperty("display");
      }
    });

    this.filterHiddenElements.clear();
  }

  bindApplyButton() {
    if (!this.applyButton) return;

    this.applyButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.form.requestSubmit();
    });
  }

  disconnectedCallback() {
    this.restoreHiddenElements();
  }
}

if (!customElements.get("search-filters")) {
  customElements.define("search-filters", SearchFilters);
}
