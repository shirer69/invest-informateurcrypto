// Logo officiel « L'Informateur Crypto » (fond détouré transparent).
export default function LogoMark({ className = "h-9 w-9" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/logo.png"
      alt="Cycle Partners"
      className={`${className} object-contain select-none`}
      draggable="false"
    />
  );
}
