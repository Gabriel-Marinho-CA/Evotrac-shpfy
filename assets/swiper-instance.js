class SwiperInstance extends HTMLElement {
  constructor() {
    super();

    this.slide_desktop = parseFloat(this.getAttribute("slide-desktop")) || 1;
    this.slide_mobile = parseFloat(this.getAttribute("slide-mobile")) || 1;
    this.have_arrows = this.hasAttribute("have-arrow");
    this.arrows_outside = this.hasAttribute("arrows-outside");
    this.have_dots = this.hasAttribute("have-dots");
    this.space_between_desk =
      parseInt(this.getAttribute("space-between-desk")) || 24;
    this.space_between_mobile =
      parseInt(this.getAttribute("space-between-mob")) || 12;
    this.loop = this.hasAttribute("loop");
    this.autoplay = this.hasAttribute("autoplay");
    this.autoplay_speed = parseInt(this.getAttribute("autoplay-speed")) || 4500;
    this.center_mode = this.hasAttribute("center-mode");

    // 👇 thumbs e direção padrão
    this.thumbs_id = this.getAttribute("thumbs-id") || null;
    this.direction = this.getAttribute("direction") || "horizontal";
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {
    this.swiper = new Swiper(this, {
      loop: this.loop,
      direction: this.direction, // direção inicial (será sobrescrita nos breakpoints)
      slidesPerView: this.slide_mobile,
      spaceBetween: this.space_between_mobile,

      centeredSlides: this.center_mode,
      centeredSlidesBounds: this.center_mode,

      // 👇 breakpoints controlam slides e direção
      breakpoints: {
        1024: {
          slidesPerView: this.slide_desktop,
          spaceBetween: this.space_between_desk,
          direction: this.direction, // mantém a direção original (ex: vertical)
          centeredSlides: false,
          centeredSlidesBounds: false,
        },
        // 👇 para telas menores que 1024px
        0: {
          spaceBetween: this.space_between_mobile,
          direction: "horizontal", // muda para horizontal no mobile
        },
      },

      navigation: this.have_arrows
        ? {
            nextEl: this.arrows_outside
              ? this.parentElement.parentElement.querySelector(
                  ".swiper-button-next"
                )
              : this.querySelector(".swiper-button-next"),
            prevEl: this.arrows_outside
              ? this.parentElement.parentElement.querySelector(
                  ".swiper-button-prev"
                )
              : this.querySelector(".swiper-button-prev"),
          }
        : false,

      pagination: this.have_dots
        ? {
            el: this.querySelector(".swiper-pagination"),
            clickable: true,
          }
        : false,

      autoplay: this.autoplay
        ? {
            delay: this.autoplay_speed,
            disableOnInteraction: false,
          }
        : false,
    });

    // 👇 conecta thumbs se houver
    if (this.thumbs_id) {
      const thumbsEl = document.getElementById(this.thumbs_id);

      const waitThumbs = () => {
        if (thumbsEl?.swiper) {
          this.swiper.thumbs.swiper = thumbsEl.swiper;
          this.swiper.thumbs.init();
          this.swiper.thumbs.update();
        } else {
          requestAnimationFrame(waitThumbs);
        }
      };

      waitThumbs();
    }
  }
}

customElements.define("swiper-instance", SwiperInstance);
