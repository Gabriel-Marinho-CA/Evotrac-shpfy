class SearchFilters extends HTMLElement {
  constructor() {
    super();

    this.formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    this.form = null;
    this.applyButton = null;
    this.filtersAside = null;
    this.sortSelects = [];
  }

  connectedCallback() {
    this.initialize();
  }

  initialize() {
    this.form = document.getElementById("formFilter");
    this.applyButton = document.getElementById("apply-filter");
    this.filtersAside = document.querySelector(".filters-aside");
    this.sortSelects = document.querySelectorAll(".wrapper-select-sort-by select");

    if (!this.form) return;

    this.bindSortSelects();
    this.bindFormSubmit();
    this.bindResponsiveBehavior();
    this.bindApplyButton();
  }


  bindSortSelects() {
    this.sortSelects.forEach((select) => {
      select.addEventListener("change", (e) => {
        this.redirectUserOrderBy(e.target.value);
      });
    });
  }

  redirectUserOrderBy(value) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set("sort_by", value);
    window.location.search = params.toString();
  }

  bindFormSubmit() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const formData = new FormData(this.form);
    const minPrice = formData.get("filter.v.price.gte");
    const maxPrice = formData.get("filter.v.price.lte");

    const priceRange = { minPrice, maxPrice };
    localStorage.setItem("price-range", JSON.stringify(priceRange));

    const minFormatted = this.formatPrice(minPrice);
    const maxFormatted = this.formatPrice(maxPrice);

    formData.set("filter.v.price.gte", minFormatted);
    formData.set("filter.v.price.lte", maxFormatted);

    const newQuery = decodeURIComponent(new URLSearchParams(formData).toString());

    this.redirectWithFilters(newQuery);
  }

  redirectWithFilters(queryString) {
    const body = document.body;
    const search = window.location.search;

    if (body.classList.contains("template-collection")) {
      window.location.search = "?" + queryString;
    } else if (body.classList.contains("template-search")) {
      const idx = search.indexOf("products");
      const base = search.substring(0, idx + 8);

      if (search.indexOf("filter") > 0) {
        window.location.search = base + "&" + queryString;
      } else {
        window.location.search = search + "&" + queryString;
      }
    }
  }

  bindResponsiveBehavior() {
    if (window.innerWidth > 1024) {
      const inputs = this.form.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("change", () => this.form.requestSubmit());
      });
    } else {
      const toggleElements = document.querySelectorAll(".wrap-sortby h3, .filters-top button");
      toggleElements.forEach((el) =>
        el.addEventListener("click", () => this.toggleFilters())
      );
    }
  }

  toggleFilters() {
    if (this.filtersAside) {
      this.filtersAside.classList.toggle("active");
    }
  }

  bindApplyButton() {
    if (!this.applyButton) return;
    this.applyButton.addEventListener("click", () => this.form.requestSubmit());
  }

  formatPrice(price) {
    if (!price && price !== 0) return "";
    return this.formatter
      .format(parseFloat(price / 100))
      .replace(/\s/g, "")
      .replace(",", ".");
  }
}

customElements.define("search-filters", SearchFilters);
