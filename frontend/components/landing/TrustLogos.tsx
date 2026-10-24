export default function TrustLogos() {
  const partners = [
    { name: "Bloomberg", font: "font-serif tracking-tight font-extrabold text-lg sm:text-xl" },
    { name: "REUTERS", font: "font-sans tracking-widest font-bold text-sm sm:text-base" },
    { name: "yahoo! finance", font: "font-sans tracking-tight font-black text-base sm:text-lg italic" },
    { name: "CNBC", font: "font-sans font-black tracking-tight text-lg sm:text-xl" },
    { name: "Investopedia", font: "font-sans font-bold tracking-tight text-base sm:text-lg" },
    { name: "FT FINANCIAL TIMES", font: "font-serif tracking-wider font-semibold text-xs sm:text-sm" },
    { name: "MarketWatch", font: "font-sans tracking-tight font-black text-sm sm:text-base uppercase" },
  ];

  return (
    <section className="relative border-y border-line-soft/60 bg-[#070c14]/80 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-widest text-text-faint font-medium">
          Trusted by forward-thinking investors, analysts and finance enthusiasts
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-300">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={`text-text-muted hover:text-white transition-colors cursor-default select-none ${partner.font}`}
            >
              {partner.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

