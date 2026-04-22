import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Terms of purchase',
  description:
    'General terms of use for the Vigor Fructus website and online purchases. (Serbian version is authoritative.)',
  alternates: {
    canonical: '/en/uslovi-kupovine',
    languages: {
      'sr-RS': `${SITE_URL}/uslovi-kupovine`,
      'en-US': `${SITE_URL}/en/uslovi-kupovine`,
      'x-default': `${SITE_URL}/uslovi-kupovine`,
    },
  },
}

export default function UsloviKupovinePage() {
  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          Pravno
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          Uslovi kupovine
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Ugovorne strane</h2>
            <p className="mt-3">
              Ovi uslovi uređuju odnos između internet prodavnice Vigor Fructus (u daljem tekstu:
              „Prodavac“) i korisnika sajta, odnosno kupca koji poručuje proizvode putem sajta.
              Korišćenjem sajta i potvrdom porudžbine korisnik potvrđuje da je upoznat sa ovim
              uslovima i da ih prihvata u celosti.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Predmet i primena</h2>
            <p className="mt-3">
              Uslovi se primenjuju na korišćenje sajta i kupovinu proizvoda Vigor Fructus putem
              online poručivanja. Proizvodi u ponudi su dehidrirano voće namenjeno za konzumaciju,
              posluživanje i upotrebu u pripremi napitaka.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Cene i plaćanje</h2>
            <p className="mt-3">
              Sve cene su iskazane u dinarima (RSD) sa uključenim PDV-om, osim ako nije drugačije
              naznačeno. Troškovi dostave se obračunavaju posebno i jasno prikazuju pre potvrde
              porudžbine. Dostupni načini plaćanja prikazani su tokom checkout procesa.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Naručivanje i zaključenje ugovora</h2>
            <p className="mt-3">
              Klikom na dugme za potvrdu porudžbine kupac šalje obavezujući zahtev za kupovinu.
              Ugovor se smatra zaključenim kada kupac primi potvrdu da je porudžbina prihvaćena.
              Prodavac zadržava pravo da odbije porudžbinu u slučaju greške u ceni, nedostupnosti
              zaliha ili tehničke greške.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Dostava</h2>
            <p className="mt-3">
              Dostava se vrši na teritoriji Republike Srbije u rokovima prikazanim pri kupovini.
              Rok može biti produžen u periodima povećanog obima porudžbina ili usled više sile.
              Kupac je dužan da obezbedi tačne podatke za isporuku.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Ograničenje odgovornosti</h2>
            <p className="mt-3">
              Sajt se koristi na sopstvenu odgovornost. Prodavac ne odgovara za privremenu
              nedostupnost sajta, tehničke prekide, niti za sadržaj i dostupnost eksternih linkova.
              Fotografije proizvoda su informativne prirode; moguća su manja odstupanja u prikazu
              boja i detalja u odnosu na stvarni proizvod.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Intelektualna svojina</h2>
            <p className="mt-3">
              Sav sadržaj na sajtu (tekstovi, fotografije, vizuelni identitet, logotipi i dizajn)
              predstavlja vlasništvo Prodavca ili se koristi po odgovarajućem pravnom osnovu i ne
              sme se koristiti bez prethodne pisane saglasnosti.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Izmene uslova</h2>
            <p className="mt-3">
              Prodavac može periodično ažurirati ove uslove radi usklađivanja sa poslovanjem i
              važećim propisima. Ažurirana verzija važi od trenutka objave na sajtu.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
