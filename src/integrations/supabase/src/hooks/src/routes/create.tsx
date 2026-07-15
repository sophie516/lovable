import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useMemo } from "react";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/create")({
  component: CreatePage,
});

function CreatePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && html.trim().length > 0 && !busy && user,
    [name, html, busy, user],
  );

  async function handlePublish() {
    if (!user) {
        setError("You must be signed in to publish.");
        return;
    }
    setBusy(true);
    try {
      const { data, error: insErr } = await supabase
        .from("widgets")
        .insert({ name, html })
        .select("id")
        .single();
      if (insErr) throw insErr;
      navigate({ to: "/v/$id", params: { id: data.id } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center italic">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#333] flex flex-col font-sans">
      <header className="border-b border-stone-200 bg-[#F5F5DC]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif tracking-tight">Widgetry</Link>
          <Link to="/" className="text-sm text-stone-500 hover:text-black transition">← Gallery</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-4xl font-serif text-stone-800">Create Widget</h1>
        <p className="text-stone-500 mt-2">Paste your HTML code to generate a Notion-ready embed.</p>

        <div className="grid lg:grid-cols-2 gap-12 mt-10">
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Widget Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Minimal Clock"
                className="w-full rounded-xl bg-white border border-stone-200 px-4 py-3 outline-none focus:border-stone-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">HTML Code</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full h-[350px] rounded-xl bg-white border border-stone-200 px-4 py-3 font-mono text-xs outline-none focus:border-stone-400 transition"
                placeholder="<div style='color: beige;'>Hello Notion</div>"
              />
            </div>

            {/* SECURITY BLOCK */}
            {user ? (
              <button
                onClick={handlePublish}
                disabled={!canSubmit}
                className="w-full rounded-full bg-stone-800 text-white py-4 font-medium hover:bg-black transition disabled:opacity-30"
              >
                {busy ? "Publishing..." : "Publish to Gallery"}
              </button>
            ) : (
              <div className="p-8 border-2 border-dashed border-stone-200 rounded-2xl bg-[#F5F5DC]/30 text-center">
                <p className="text-stone-600 mb-4 font-serif italic">A widget is a gift to the community. Please sign in to share yours.</p>
                <Link to="/auth" className="inline-block bg-stone-800 text-white px-8 py-2 rounded-full text-sm">Sign In to Publish</Link>
              </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="sticky top-10">
            <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Live Preview</label>
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm" style={{ height: 480 }}>
              <iframe
                title="preview"
                srcDoc={html}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
