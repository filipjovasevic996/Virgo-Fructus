import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Način prikupljanja, korišćenja i čuvanja podataka o ličnosti.',
}

export default function PolitikaPrivatnostiPage() {
  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          Pravno
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          Politika privatnosti
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">1. Opšte informacije</h2>
            <p className="mt-3">
              Vaša privatnost nam je važna. Ova Politika privatnosti objašnjava koje podatke
              prikupljamo, zašto ih obrađujemo, koliko dugo ih čuvamo i koja prava imate kao lice
              na koje se podaci odnose. Politika se primenjuje na korišćenje sajta Vigor Fructus i
              online poručivanje proizvoda.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">2. Upravljač i kontakt</h2>
            <p className="mt-3">
              Upravljač podataka je Vigor Fructus, kao pružalac usluge putem ovog sajta. Za pitanja
              u vezi sa obradom podataka i ostvarivanjem prava možete nam pisati na{' '}
              <a className="underline hover:text-text-nav-hover" href="mailto:vigorfructus@gmail.com">
                vigorfructus@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">3. Pravne osnove i svrhe obrade</h2>
            <p className="mt-3">
              Podatke obrađujemo na osnovu: (a) izvršenja ugovora (obrada i isporuka porudžbine),
              (b) zakonskih obaveza (računovodstveni i poreski propisi), (c) legitimnog interesa
              (bezbednost sajta, sprečavanje zloupotreba, poslovna analitika) i (d) saglasnosti
              kada je potrebna (npr. marketinška obaveštenja).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">4. Koje podatke prikupljamo</h2>
            <p className="mt-3">
              U zavisnosti od načina korišćenja sajta, možemo prikupljati: ime i prezime, email
              adresu, broj telefona, adresu za dostavu, podatke o porudžbini i tehničke podatke
              neophodne za funkcionisanje sajta (npr. IP adresa, tip uređaja, kolačići). Podatke o
              platnim karticama ne čuvamo u našem sistemu kada se plaćanje vrši preko eksternog
              provajdera plaćanja.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">5. Kolačići i srodne tehnologije</h2>
            <p className="mt-3">
              Kolačiće koristimo za osnovnu funkcionalnost sajta, analitiku i unapređenje korisničkog
              iskustva. Podešavanja kolačića možete kontrolisati preko svog internet pregledača.
              Odbijanje pojedinih kolačića može ograničiti dostupnost nekih funkcija sajta.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">6. Deljenje podataka</h2>
            <p className="mt-3">
              Podaci se dele samo kada je to neophodno za izvršenje usluge: dostava, hosting,
              tehnička podrška i obrada plaćanja. Sa partnerima koji obrađuju podatke u naše ime
              zaključujemo odgovarajuće ugovore o obradi podataka. Podatke možemo dostaviti i
              nadležnim organima kada to zakon zahteva.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">7. Rokovi čuvanja podataka</h2>
            <p className="mt-3">
              Podatke čuvamo onoliko dugo koliko je potrebno za svrhu obrade i ispunjenje zakonskih
              obaveza. Podaci vezani za porudžbine i račune čuvaju se u rokovima propisanim važećim
              finansijskim i poreskim propisima.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">8. Bezbednost podataka</h2>
            <p className="mt-3">
              Primenjujemo razumne tehničke i organizacione mere za zaštitu podataka od neovlašćenog
              pristupa, izmene, gubitka ili zloupotrebe. Iako primenjujemo odgovarajuće mere zaštite,
              nijedan internet prenos podataka ne može biti apsolutno bezbedan.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">9. Prava korisnika</h2>
            <p className="mt-3">
              Korisnik ima pravo na pristup, ispravku, brisanje, ograničenje obrade i prigovor,
              kao i pravo na prenosivost podataka, u skladu sa važećim propisima. Zahtev možete
              poslati na{' '}
              <a className="underline hover:text-text-nav-hover" href="mailto:vigorfructus@gmail.com">
                vigorfructus@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">10. Pravo na žalbu</h2>
            <p className="mt-3">
              Ako smatrate da se vaši podaci obrađuju suprotno propisima, imate pravo da podnesete
              pritužbu nadležnom organu za zaštitu podataka o ličnosti u Republici Srbiji.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">11. Izmene politike privatnosti</h2>
            <p className="mt-3">
              Zadržavamo pravo ažuriranja ove politike radi usklađivanja sa poslovanjem i zakonskim
              zahtevima. Svaka izmena stupa na snagu danom objave na sajtu.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
