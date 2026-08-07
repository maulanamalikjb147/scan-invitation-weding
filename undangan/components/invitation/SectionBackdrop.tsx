import Image from "next/image";

export function SectionBackdrop({
  src,
  position = "object-center",
  strength = "opacity-[.55]",
}: {
  src: string;
  position?: string;
  strength?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className={`scale-105 object-cover ${position} ${strength}`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.80)_0%,rgba(19,20,16,.42)_20%,rgba(19,20,16,.48)_80%,rgba(19,20,16,.84)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[.5px]" />
    </div>
  );
}
