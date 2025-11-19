import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintPage(props) {
  const params = await props.params;
  const id = params?.id;

  if (!id) return notFound();

  const device = await prisma.device.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!device) return notFound();

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("ro-RO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  const createdAt = device.createdAt ? new Date(device.createdAt) : null;

  const trackUrl = `https://procomputer.ro/track/${device.publicToken}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(trackUrl)}`;

  const green = "#C8E6A0"; // verde pastel

  return (
    <div className="w-full flex justify-center bg-gray-100 print:bg-white p-2">
      <div className="w-[210mm] min-h-screen bg-white p-5 print:p-5 text-[13px] leading-snug">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <img src="/logo.png" className="h-[85px] w-auto" />

          <div className="flex-1 text-center text-xs leading-tight -mt-1">
            <p className="font-bold text-lg uppercase">ALEDYMAR IT SRL</p>
            <p>CUI: 33914128</p>
            <p>J2014014663405</p>
            <p>Tel: 0747 388 167</p>
          </div>

          <img src={qrSrc} className="w-20 h-20 border border-gray-300" />
        </div>

        <div style={{ borderTop: `3px solid ${green}` }} className="mb-3"></div>

        <h1 className="text-xl text-center font-bold uppercase mb-1">
          Proces verbal de predare - primire
        </h1>

        <p className="text-center text-sm mb-4">
          Fișă service nr. <b>{device.formCode}</b> — {formatDate(createdAt)}
        </p>

        {/* ======================================================
            1. CLIENT
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">1. Informații client</h2>

        <div className="rounded-md border border-gray-300 mb-3">
          <div
            className="grid grid-cols-4 font-semibold text-center text-gray-900"
            style={{ background: green }}
          >
            <div className="p-1.5">Nume client</div>
            <div className="p-1.5">Telefon</div>
            <div className="p-1.5">Email</div>
            <div className="p-1.5">Data intrare</div>
          </div>

          <div className="grid grid-cols-4 text-center">
            <div className="p-2">{device.client?.name || "-"}</div>
            <div className="p-2">{device.client?.phone || "-"}</div>
            <div className="p-2">{device.client?.email || "-"}</div>
            <div className="p-2">{formatDate(device.createdAt)}</div>
          </div>
        </div>

        {/* ======================================================
            2. OBSERVAȚII CLIENT
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">2. Observații client</h2>

        <table className="w-full mb-3 border border-gray-300">
          <tbody>
            <tr style={{ background: green }}>
              <td className="p-1.5 font-semibold">Observații client</td>
            </tr>
            <tr>
              <td className="p-2 whitespace-pre-wrap">
                {device.problem || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ======================================================
            3. ECHIPAMENT
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">3. Informații echipament</h2>

        <div className="rounded-md border border-gray-300 mb-3">
          <div
            className="grid grid-cols-4 font-semibold text-center"
            style={{ background: green }}
          >
            <div className="p-1.5">Tip</div>
            <div className="p-1.5">Marcă</div>
            <div className="p-1.5">Model</div>
            <div className="p-1.5">Serie</div>
          </div>

          <div className="grid grid-cols-4 bg-white text-center">
            <div className="p-2">{device.deviceType || "-"}</div>
            <div className="p-2">{device.brand || "-"}</div>
            <div className="p-2">{device.model || "-"}</div>
            <div className="p-2">{device.serialNumber || "-"}</div>
          </div>
        </div>

        {/* ======================================================
            4. SITUAȚIE LA PRIMIRE
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">4. Situație la primire</h2>

        <div className="rounded-md border border-gray-300 mb-3">
          <div
            className="grid grid-cols-3 font-semibold text-center"
            style={{ background: green }}
          >
            <div className="p-1.5">Defect reclamat</div>
            <div className="p-1.5">Accesorii predate</div>
            <div className="p-1.5">Observații</div>
          </div>

          <div className="grid grid-cols-3 bg-white text-center">
            <div className="p-2">{device.problem || "-"}</div>
            <div className="p-2">{device.accessories || "-"}</div>
            <div className="p-2">{device.receptionNotes || device.notes || "-"}</div>
          </div>
        </div>

        {/* ======================================================
            5. COSTURI & PLĂȚI
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">5. Costuri și plăți</h2>

        <div className="rounded-md border border-gray-300 mb-3">
          <div
            className="grid grid-cols-3 font-semibold text-center"
            style={{ background: green }}
          >
            <div className="p-1.5">Preț</div>
            <div className="p-1.5">Avans</div>
            <div className="p-1.5">Garanție</div>
          </div>

          <div className="grid grid-cols-3 bg-white text-center">
            <div className="p-2">{device.priceEstimate || "-"} lei</div>
            <div className="p-2">{device.advance || "-"} lei</div>
            <div className="p-2">90 zile</div>
          </div>
        </div>

        {/* ======================================================
            6. OBSERVAȚII TEHNICE
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">6. Observații tehnice</h2>

        <table className="w-full mb-3 border border-gray-300">
          <tbody>
            <tr style={{ background: green }}>
              <td className="p-1.5 font-semibold">Device Observații</td>
            </tr>
            <tr>
              <td className="p-2 whitespace-pre-wrap">{device.notes || "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* ======================================================
            TERMENI & CONDIȚII (compact + font mare)
        ====================================================== */}
        <h2 className="uppercase font-bold mb-1">Termeni și condiții</h2>

        <div className="border border-gray-300 rounded-md p-2 text-[12px] leading-snug bg-[#F9FFF4]">
          <p>
            Nu se primesc colete cu ramburs decât pentru unitățile în garanție. 
            Taxele pentru aparatele nereparate în garanție sunt suportate de client.
          </p>
          <p className="mt-1">
            Echipamentele pot avea defecte ascunse care pot apărea sau se pot agrava în timpul procesului de reparație.
          </p>
          <p className="mt-1">
            Nu se face backup de date; pierderea acestora nu este responsabilitatea service-ului.
          </p>
          <p className="mt-1">
            Termen maxim reparație: 15 zile lucrătoare. Depășirea termenului atrage taxe suplimentare.
          </p>
        </div>

        {/* Semnături */}
        <div className="flex justify-between mt-6 px-4 text-xs">
          <div className="text-center">
            <p className="font-semibold">Client</p>
            <div className="border-t border-black mt-6 w-40 mx-auto"></div>
          </div>

          <div className="text-center">
            <p className="font-semibold">Reprezentant service</p>
            <div className="border-t border-black mt-6 w-40 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}