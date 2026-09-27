import "./MatteSunStickAd.css";

const assetBase = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/images`;

export default function MatteSunStickAd() {
  return (
    <main className="boj-ad" aria-label="Beauty of Joseon Matte Sun Stick advertisement">
      <img
        className="boj-ad__photo"
        src={`${assetBase}/boj-product.png`}
        alt="Beauty of Joseon Matte Sun Stick with a botanical sprig"
      />
      <img
        className="boj-ad__logo"
        src={`${assetBase}/boj-logo.png`}
        alt="Beauty of Joseon"
      />

      <section className="boj-ad__copy">
        <div className="boj-ad__eyebrow" aria-hidden="true" />
        <h1 className="boj-ad__headline">On your way,<br />keep it light.</h1>
        <p className="boj-ad__name">Matte Sun Stick</p>
        <p className="boj-ad__benefit">Non-greasy, soft-matte finish.</p>
      </section>

      <div className="boj-ad__cta" aria-label="Explore the Sun Stick">
        <span>Explore the Sun Stick</span>
        <span className="boj-ad__arrow" aria-hidden="true" />
      </div>
    </main>
  );
}