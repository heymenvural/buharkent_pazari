export function flyToCart(source: HTMLElement) {
  // Navbar gizliyse önce göster
  window.dispatchEvent(new Event("cart:fly"));

  const target = document.getElementById("cart-icon");
  if (!target) return;

  const start = () => {
    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    const clone = source.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: "fixed",
      left: `${s.left}px`,
      top: `${s.top}px`,
      width: `${s.width}px`,
      height: `${s.height}px`,
      margin: "0",
      zIndex: "200",
      pointerEvents: "none",
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: "0 20px 40px -10px rgba(43,38,32,.35)",
    });
    document.body.appendChild(clone);

    const dx = t.left + t.width / 2 - (s.left + s.width / 2);
    const dy = t.top + t.height / 2 - (s.top + s.height / 2);

    const anim = clone.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 80}px) scale(0.45) rotate(-8deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.05) rotate(10deg)`, opacity: 0.5 },
      ],
      { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)" }
    );

    anim.onfinish = () => {
      clone.remove();
      target.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.35) rotate(-10deg)" }, { transform: "scale(1)" }],
        { duration: 450, easing: "ease-out" }
      );
    };
  };

  // Navbar ekran dışındaysa içeri kaymasını bekle
  if (target.getBoundingClientRect().bottom < 0) setTimeout(start, 450);
  else start();
}