import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/v/$id")({ component: WidgetView });

function WidgetView() {
  const { id } = useParams({ from: '/v/$id' });
  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "1";

  const { data: widget, isLoading } = useQuery({
    queryKey: ["widget", id],
    queryFn: async () => {
      const { data } = await supabase.from("widgets").select("*").eq("id", id).single();
      return data;
    },
  });

  // THE FIX: If it's an embed, remove the beige background from the whole page
  useEffect(() => {
    if (isEmbed) {
      document.body.style.backgroundColor = "transparent";
      document.body.style.backgroundImage = "none";
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = "transparent";
    }
  }, [isEmbed]);

  if (isLoading) return null;
  if (!widget) return <div className="p-10 text-center">Widget not found</div>;

  // VIEW 1: This is what Notion sees
  if (isEmbed) {
    return (
      <div 
        style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }} 
        dangerouslySetInnerHTML={{ __html: widget.html }} 
      />
    );
  }

  // VIEW 2: This is what you see on your website
  const embedUrl = `${window.location.origin}/v/${id}?embed=1`;

  return (
    <div className="min-h-screen p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-stone-400 hover:text-black transition">← Back to Gallery</a>
        <h1 className="text-4xl font-serif mt-6 mb-2">{widget.name}</h1>
        <p className="text-stone-500 mb-10 italic">Created on {new Date(widget.created_at).toLocaleDateString()}</p>
        
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-10">
            <div className="p-4 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400">Preview</div>
            <div className="p-0" style={{ minHeight: '300px' }}>
                <div dangerouslySetInnerHTML={{ __html: widget.html }} />
            </div>
        </div>

        <div className="bg-[#FAF9F6] border border-stone-200 p-8 rounded-2xl">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Notion Instructions</h3>
          <p className="text-sm text-stone-600 mb-4">Copy the link below and paste it into Notion. Select <strong>"Create Embed"</strong>.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 block text-xs bg-white border border-stone-200 p-4 rounded-lg break-all select-all">
              {embedUrl}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
