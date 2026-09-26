import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="display mt-4 text-4xl text-charcoal sm:text-5xl">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-4 max-w-md text-steel">
        Le lien est peut-être obsolète ou la page a été déplacée.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/contact" className="btn btn-outline">
          Nous contacter
        </Link>
      </div>
    </div>
  );
}
