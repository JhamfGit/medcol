import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border py-4 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between px-4">
      <Link href="https://jhamfgroup.net/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
        <Image
          src="logo_jhamf.png"
          alt="Logo Jhamf"
          width={32}
          height={32}
          className="rounded-sm"
        />
        Desarrollado por JHAMF Group
      </Link>
      <p className="mt-2 sm:mt-0">&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
    </footer>
  );
}