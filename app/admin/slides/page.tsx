import AdminSlideManager from "@/components/AdminSlideManager";
import { getAdminSlides, requireAdminPageSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminSlidesPage() {
  await requireAdminPageSession();
  const slides = await getAdminSlides();

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a,_#7c3aed_52%,_#eef2ff)] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100">
          Slider
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Homepage hero manager
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50">
          Upload hero images, add multiple slides, control order, and keep the homepage slider rotating automatically.
        </p>
      </section>

      <AdminSlideManager initialSlides={slides} />
    </div>
  );
}
