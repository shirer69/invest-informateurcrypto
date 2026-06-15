"use client";
import Image from "next/image";

export default function LegalDisclaimer({ compact = false }) {
  return (
    <div id="disclaimer" className={`mt-2 rounded-xl border hairline bg-white/[0.015] px-4 py-4 ${compact ? "text-[10.5px]" : "text-[11px]"} leading-relaxed text-mist/55 scroll-mt-24`}>
      {/* Accréditations */}
      <p className="mb-2">
        <a href="#disclaimer" className="float-right ml-2 opacity-40 hover:opacity-80 hover:text-gold transition-opacity text-[10px] leading-none select-none" aria-label="Lien vers cette section">#</a>
        <span className="text-mist/80 font-medium">Julien Moretto — Conseiller en Investissements Financiers (CIF)</span>{" "}
        enregistré à l'ORIAS sous le n°&nbsp;<span className="text-mist/75 font-mono">25008843</span>{" "}
        (<a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold/80 transition-colors">www.orias.fr</a>),
        titulaire du certificat AMF (Autorité des Marchés Financiers) et membre de l'ANACOFI-CIF,
        association professionnelle agréée par l'AMF.
      </p>

      {/* Disclaimer investissement */}
      <p>
        Les informations et analyses diffusées sur cette plateforme sont fournies à titre éducatif et informatif uniquement.
        Elles ne constituent pas un conseil en investissement personnalisé au sens de la réglementation en vigueur.
        Tout investissement comporte un risque de perte en capital, pouvant être partielle ou totale.
        Les performances passées ne préjugent pas des performances futures.
        Avant toute décision d'investissement, évaluez votre situation financière, vos objectifs et votre tolérance au risque.
      </p>

      {/* Logos */}
      <div className="mt-4 flex items-center gap-6 flex-wrap opacity-60">
        <Image src="/logos/orias.svg" alt="ORIAS" width={90} height={26} className="h-[22px] w-auto object-contain brightness-0 invert opacity-70" unoptimized />
        <Image src="/logos/anacofi.svg" alt="ANACOFI-CIF" width={105} height={36} className="h-[30px] w-auto object-contain brightness-0 invert opacity-70" unoptimized />
        <Image src="/logos/amf.svg" alt="AMF — Autorité des Marchés Financiers" width={80} height={36} className="h-[28px] w-auto object-contain brightness-0 invert opacity-70" unoptimized />
      </div>
    </div>
  );
}
