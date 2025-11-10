class ZoomImage extends HTMLElement {
  constructor() {
    super();
    this.scale = parseFloat(this.getAttribute("scale")) || 2; // Fator de zoom configurável
    this.transition = this.getAttribute("transition") || "0.3s ease";
    this.disableMobile = !this.hasAttribute("mobile"); // desativa no mobile por padrão
  }

  connectedCallback() {
      const imgSrc = this.getAttribute("src");
      const alt = this.getAttribute("alt") || "";

      this.style.display = "block";
      this.style.overflow = "hidden";
      this.style.cursor = "zoom-in";
      this.style.position = "relative";

      this.innerHTML = `
      <img src="${imgSrc}" alt="${alt}" style="
        width: 100%;
        height: auto;
        display: block;
        transform-origin: center center;
        transition: transform ${this.transition};
        will-change: transform;
      ">
    `;

      this.img = this.querySelector("img");

      if (this.disableMobile && window.matchMedia("(max-width: 768px)").matches)
        return;

      this.addEventListener("mouseenter", this.onEnter.bind(this));
      this.addEventListener("mousemove", this.onMove.bind(this));
      this.addEventListener("mouseleave", this.onLeave.bind(this));
  }

  onEnter() {
    this.img.style.transform = `scale(${this.scale})`;
  }

  onMove(e) {
    const rect = this.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.img.style.transformOrigin = `${x}% ${y}%`;
  }

  onLeave() {
    this.img.style.transform = "scale(1)";
    this.img.style.transformOrigin = "center center";
  }
}

customElements.define("zoom-image", ZoomImage);
