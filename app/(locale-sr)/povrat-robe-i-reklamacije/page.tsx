import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Povrat robe i reklamacije',
  description: 'Informacije o pravu na odustanak, povratu robe i reklamacijama.',
  alternates: {
    canonical: '/povrat-robe-i-reklamacije',
    languages: {
      'sr-RS': `${SITE_URL}/povrat-robe-i-reklamacije`,
      'en-US': `${SITE_URL}/en/povrat-robe-i-reklamacije`,
      'x-default': `${SITE_URL}/povrat-robe-i-reklamacije`,
    },
  },
}

export default function PovratRobeIReklamacijePage() {
  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          Pravno
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          Povrat robe i reklamacije
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Pravo na odustanak</h2>
            <p className="mt-3">
              Kupac ima pravo da odustane od kupovine u roku od 14 dana od prijema pošiljke, bez
              navođenja razloga, u skladu sa važećim Zakonom o zaštiti potrošača.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Uslovi za povrat</h2>
            <p className="mt-3">
              Proizvod koji se vraća treba da bude neotvoren, nekorišćen i, kad god je moguće, u
              originalnom pakovanju. Trošak povrata robe snosi kupac, osim u slučaju kada je
              isporučen pogrešan ili neispravan proizvod.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Reklamacije</h2>
            <p className="mt-3">
              Ako je proizvod oštećen, pogrešno isporučen ili ne odgovara narudžbini, kupac može
              podneti reklamaciju. U zahtevu je potrebno navesti broj porudžbine, opis problema i,
              po mogućstvu, fotografije proizvoda/paketa.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Rok za odgovor</h2>
            <p className="mt-3">
              Prodavac potvrđuje prijem reklamacije bez odlaganja i odgovara u zakonskom roku.
              Nakon potvrde opravdanosti reklamacije, kupac može ostvariti pravo na zamenu
              proizvoda, povraćaj sredstava ili drugo zakonsko rešenje.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Povraćaj novca</h2>
            <p className="mt-3">
              Povraćaj sredstava se vrši istim načinom plaćanja koji je korišćen prilikom kupovine,
              osim ako se kupac i prodavac drugačije dogovore. Povraćaj se realizuje nakon prijema
              vraćene robe ili dokaza da je roba poslata nazad.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">Kontakt za povrat i reklamacije</h2>
            <p className="mt-3">
              Zahtev možete poslati na <a className="underline hover:text-text-nav-hover" href="mailto:vigorfructus@gmail.com">vigorfructus@gmail.com</a> uz
              relevantne informacije o porudžbini. Po potrebi, tim će vam dostaviti dalje korake i
              adresu za povrat.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
