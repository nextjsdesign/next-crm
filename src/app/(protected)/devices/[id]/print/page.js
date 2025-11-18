import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintPageButtons from "./PrintPageButtons";

export default async function PrintPage(props) {
  const params = await props.params; // ✅ Next.js 15–16: params este Promise
  const id = params?.id;

  if (!id) return notFound();

  const device = await prisma.device.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!device) return notFound();

  const createdAt = device.createdAt ? new Date(device.createdAt) : null;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ro-RO");
  };

  // 🔗 Link public de tracking (momentan localhost)
  const trackUrl = device.publicToken
    ? `http://localhost:3000/track/${device.publicToken}`
    : null;

  // 🧾 QR code (serviciu extern simplu)
  const qrSrc = trackUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
        trackUrl
      )}`
    : null;

  return (
    <>
      {/* 🔵 Butoane (Print + Înapoi) – vizibile doar pe ecran, ascunse la print */}
      <div className="max-w-3xl mx-auto mt-4 mb-2 print:hidden">
        <PrintPageButtons />
      </div>

      {/* PAGINA 1 – Proces verbal de predare-primire */}
      <div className="max-w-3xl mx-auto bg-white text-black p-8 shadow print:shadow-none print:p-4 print:bg-white text-sm leading-relaxed">
        {/* HEADER: logo + firmă + QR */}
        <header className="flex justify-between items-start mb-4">
          {/* Logo + firmă */}
          <div className="flex items-start gap-3">
            <img
              src="/logo.png"
              alt="ProComputer"
              className="w-20 h-20 object-contain"
            />
            <div className="text-xs">
              <div className="font-semibold text-base">ALEDYMAR IT SRL</div>
              <div>CUI: 33914128</div>
              <div>J2014014663405</div>
              <div>Tel: 0747 388 167</div>
            </div>
          </div>

          {/* QR doar (fără text cu link) */}
          {qrSrc && (
            <div className="flex flex-col items-end text-[10px] text-gray-600">
              <img
                src={qrSrc}
                alt="QR tracking"
                className="w-20 h-20 border border-gray-300"
              />
              <span className="mt-1">Scan pentru status service</span>
            </div>
          )}
        </header>

        {/* TITLU + COD + DATĂ */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs text-gray-700">
            Data primirii: <b>{formatDate(createdAt)}</b>
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold uppercase">
              Proces verbal de predare-primire
            </h1>
            <p className="text-sm mt-1">
              Fișă service nr.{" "}
              <span className="font-semibold">{device.formCode}</span>
            </p>
          </div>

          <div className="w-24" />
        </div>

        {/* SECȚIUNEA CLIENT */}
        <section className="border border-gray-300 rounded-md p-3 mb-3">
          <h2 className="font-semibold mb-2 text-sm uppercase">
            Date client
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <p>
              <span className="font-semibold">Nume client:</span>{" "}
              {device.client?.name || "—"}
            </p>
            <p>
              <span className="font-semibold">Telefon:</span>{" "}
              {device.client?.phone || "—"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {device.client?.email || "—"}
            </p>
            <p>
              <span className="font-semibold">Adresă:</span>{" "}
              {device.client?.address || "—"}
            </p>
          </div>
        </section>

        {/* SECȚIUNEA DISPOZITIV */}
        <section className="border border-gray-300 rounded-md p-3 mb-3">
          <h2 className="font-semibold mb-2 text-sm uppercase">
            Date dispozitiv
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <p>
              <span className="font-semibold">Tip:</span>{" "}
              {device.deviceType || "—"}
            </p>
            <p>
              <span className="font-semibold">Marcă:</span>{" "}
              {device.brand || "—"}
            </p>
            <p>
              <span className="font-semibold">Model:</span>{" "}
              {device.model || "—"}
            </p>
            <p>
              <span className="font-semibold">Serie:</span>{" "}
              {device.serialNumber || "—"}
            </p>
          </div>
        </section>

        {/* SECȚIUNE: Situație la primire */}
        <section className="border border-gray-300 rounded-md p-3 mb-3">
          <h2 className="font-semibold mb-2 text-sm uppercase">
            Situație la primire
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold">
                Defect reclamat / descriere:
              </span>
              <p className="mt-0.5">
                {device.problem || device.description || "—"}
              </p>
            </div>
            <div>
              <span className="font-semibold">Accesorii predate:</span>
              <p className="mt-0.5">{device.accessories || "—"}</p>
            </div>
            <div>
              <span className="font-semibold">Starea la primire:</span>
              <p className="mt-0.5">
                {device.receptionCondition || "—"}
              </p>
            </div>
            <div>
              <span className="font-semibold">Observații:</span>
              <p className="mt-0.5">
                {device.receptionNotes || device.notes || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* TERMENI GENERALI – FAȚA FIȘEI */}
        <section className="border border-gray-300 rounded-md p-3 mb-4">
          <h2 className="font-semibold mb-2 text-sm uppercase">
            Termeni și condiții – primire în service
          </h2>
          <div className="text-[11px] space-y-2 text-justify">
            <p>
              Nu se primesc colete cu ramburs decat pentru unitatile ce sunt
              identificate cu defect in garantie. Taxele pentru aparatele ce nu
              vor fi reparate in garantie vor fi suportate de catre client.
              Serviciile prestate sunt de cea mai buna calitate. Pentru piesele
              predate de client in vederea reparatiei nu se ofera garantie.
            </p>
            <p>
              Am luat la cunostinta toate informatiile din prezentul document,
              conditiile de reparatie, piesele inlocuite, si conditiile
              ulterioare de garantie. Unitatea service nu raspunde pentru
              defectele ascunse ale echipamentului ce pot aparea in procesul de
              reparatie. (ex: contacte imperfecte, lipituri reci, flexuri
              semiconductoare, carcasa torsionata, contact cu lichide, etc,.)
              Acestea pot fi defecte ce nu se manifestau initial iar in timpul
              procesului de reparatie acestea sa apara sau chiar sa se agraveze
              starea initiala a acestuia. Clientul va fi anuntat pe caile de
              comunicare cu privire la deficientele aparute in timpul
              interventiei.
            </p>
            <p>
              Societatea va repara doar solicitarile notate in prezentul
              document. Nu se face backup de date inainte de reparatie si nu
              vom fi responsabili daca aceste date se pierd sau se corup.
              Perioada de reparare a echipamentelor de service este de maxim 15
              zile lucratoare dupa informarea privind finalizarea reparatiei.
              Dupa aceasta perioada societatea va percepe o taxa de depozitare a
              produsului de 1% pe zi din valoarea reparatiei. Dupa o perioada de
              90 de zile calendaristice da la data anuntarii Clientului in scris
              privind finalizarea reparatiei si nepreluarea echipamentului,
              societatea va actiona in conditiile legii pentru recuperarea
              prejudiciului.
            </p>
            <p>
              Va informam ca datele dvs cu caracter personal ce sunt mentionate
              in prezenta nu vor fi folosite in nici un scop. Datele personale
              notate in prezentul document vor fi folosite doar pentru informari
              aduse conform termenilor mentionati anterior si in scopul
              reparatiilor solicitate. Prin semnarea prezentului document va
              dati acordul cu privire la conditiile mentionate anterior.
            </p>
          </div>
        </section>

        {/* SEMNĂTURI */}
        <section className="mt-6 flex justify-between text-xs">
          <div className="flex flex-col items-start">
            <span className="font-semibold">Client</span>
            <div className="mt-10 border-t border-gray-400 w-40 text-center text-[11px]">
              Semnătură
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-semibold">Reprezentant service</span>
            <div className="mt-10 border-t border-gray-400 w-40 text-center text-[11px]">
              Semnătură și ștampilă
            </div>
          </div>
        </section>

        <div className="mt-4 text-[10px] text-gray-500 text-right">
          Generat la: {formatDateTime(new Date())}
        </div>
      </div>

      {/* PAGINA 2 – Condiții de garanție */}
      <div className="max-w-3xl mx-auto bg-white text-black p-8 mt-8 shadow print:shadow-none print:p-4 print:bg-white text-sm leading-relaxed">
        <header className="flex justify-between items-start mb-6">
          <div>
            <div className="font-semibold text-base">ALEDYMAR IT SRL</div>
            <div className="text-xs">
              Certificat de garanție – fișă {device.formCode}
            </div>
          </div>
        </header>

        <h2 className="text-lg font-bold mb-3 uppercase">
          Termeni și condiții de garanție
        </h2>

        <div className="text-[11px] space-y-2 text-justify">
          <p>
            Garantia este in conformitate cu prevederile OUG 140/2021 si ale OG
            21/1992 rep 2 si se aplica doar pentru interventiile efectuate.
            Garantia pieselor este de 24 de luni.
          </p>
          <p>
            Garantia pentru manopera interventiei se acorda doar pentru
            defectiunile reparate ale produsului si nu pentru alte defectiuni
            neanuntate si nesolicitate in scris la predare sau altele aparute pe
            parcursul garantiei. Termenul de interventie pentru lucrarile aflate
            in garantie se vor efectua in maxim 15 zile de la data identificarii
            defectului. Interventiile in garantie sunt efectuate prin
            intretinere, reparare, inlocuire a pieselor ce prezinta vicii
            ascunse.
          </p>
          <p>
            In cazul echipamentelor cu defectiuni grave, service-ul nu isi
            asuma responsabilitatea daca in urma procesului de reparatie, acesta
            manifesta alte defecte decat acelea pentru care a fost solicitata
            reparatia. Garantia produce efecte doar daca defectul este prezentat
            serviceului ce a efectuat interventia initiala.
          </p>
          <p>
            Nu se acorda garantie pentru echipamentele ce prezinta carcase
            lovite, antene rupte, conectori deteriorati, ecran spart,
            suprasarcina, socuri electrice, mecanice, termice, banda ecran
            rupta sau deteriorata, contact cu lichid, defectiuni provocate,
            interventii neanuntate si neautorizate de service asupra pieselor
            aflate in garantie.
          </p>
          <p>
            Lipsa sau deteriorarea sigiliului de garantie, precum si pierderea
            prezentei si a documentelor fiscale.
          </p>
          <p>
            Atentie ! In cazul operatiunilor de programare software a
            echipamentului, datele pesonale pot fi sterse irecuperabil
            (contacte, calendar, album multimedia, etc,..).
          </p>
          <p>
            Daca in timpul interventiei service asupra echipamentelor, apar
            alte defecte ce necesita inlocuirea unor piese ce nu au fost
            specificate in reparatia solicitata, service-ul va efectua o
            informare prin sms sau email la datele de contact ale clientului
            inregistrate in prezentul document. Solicitarea transmisa se va
            efectua pentru acordul dvs privind modificarea pretului si al
            termenului de reparatie.
          </p>
          <p>
            Termenul de reparatie al echipamentui mentionat anterior in prezenta
            se va prelungi automat cu timpul scurs de la informarea transmisa de
            service pana la raspunsul primit (acceptul interventiei). In
            situatia in care costurile dupa recalcularea reparatiei nu vor fi
            acceptate, societate va preda echipamentul in starea preluata, (daca
            este posibil, avand in vedere ca produsul nu este nou si in timpul
            interventiei service pot aparea defecte ce ascunse  prin natura
            interventiei poate agrava stare tehnica) la termenul stabilit
            initial in prezenta sau altul stabilit intre parti prin metodele de
            comunicare. Pentru manopera si diagnosticarea echipamentului
            societatea va recalcula sumele solicitate.
          </p>
          <p>
            Prestatorul nu isi asuma responsabilitatea in cazul in care produsul
            nu mai poate fi adus la starea initiala predarii, avand in vedere ca
            la demontare pot aparea situatii in care piesele imbatranite nu mai
            pot fi reansamblate datorita unor deteriorarii ireparabile ale
            acestora. Acestea sunt considerate deseuri si nu sunt datoarete
            demontarii. Deseurile vor fi prezentate cu explicatii si predate
            Clientului.
          </p>
          <p>
            Clientul se obliga sa exploateze si sa intretina produsul reparat in
            conformitate cu instructiunile prevazute in cartile tehnice emise de
            producatorul acestora, precum si ale certificatelor de garantie.
            Nerespectarea de catre client a mentiunilor de mai sus poate duce la
            respingerea pretentiilor de garantie exercitate impotriva sa fara a
            putea fi obligata la plata despagubirii.
          </p>
          <p>
            Prin semnarea documentului clientii declara ca au fost informati
            despre continutul si conditiile acestuia si ca inteleg sa si le
            asume si sa le respecte in raporturile sale cu ALEDYMAR IT SRL. In
            caz de neplata a facturilor rezultate ca urmare a interventiei
            service, societatea poate exercita un drept de retentie asupra
            produsului pana la plata integrala a facturii finale si a oricaror
            cheltuieli necesare si utile care au fost suportate in acest sens si
            a costurilor aferente exercitarii dreptului de retentie potrivit art
            2495 din Codul Civil. Neplata in termen a sumelor facturate emise pe
            numele Clientului atrage dupa sine penalizari, in valoare totala de
            1% din valoarea facturata pentru fiecare zi de intarziere.
          </p>
          <p>
            Persoana care lanseaza comanda de piese si preda produsul este
            considerata a fi imputernicita pentru a semna documente și își asuma
            toate obligatiile ce ii revin în acesta calitate. Nu se aduce
            atingere dreptului ALEDYMAR IT SRL de a pretinde Clientului
            respectarea obligatiilor asumate prin semnarea documentului chiar de
            catre o persoana fara imputernicire scrisa si de a antrena in mod
            direct raspunderea clientului prin prezentul Contract. Dispozitiile
            art 210; art 1.309 – 1.310 și art 1.336 alin. 1 din Codul Civil se
            vor aplica in mod corespunzator.
          </p>
          <p>
            Daca codul de acces al echipamentului nu este mentionata în
            document, societatea service nu poate face teste complete de
            verificare. Daca reparatiile efectuate nu pot fi testate societatea
            nu se face raspunzatoare pentru defecte aparute ce nu au putut fi
            cunoscute în procesul de reparație.
          </p>
        </div>

        <section className="mt-8 flex justify-between text-xs">
          <div className="flex flex-col items-start">
            <span className="font-semibold">Client</span>
            <div className="mt-10 border-t border-gray-400 w-40 text-center text-[11px]">
              Semnătură
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-semibold">Reprezentant service</span>
            <div className="mt-10 border-t border-gray-400 w-40 text-center text-[11px]">
              Semnătură și ștampilă
            </div>
          </div>
        </section>
      </div>
    </>
  );
}