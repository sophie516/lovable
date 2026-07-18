import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/v/$id")({ component: WidgetView });

function WidgetView() {
  const params = Route.useParams();
  // Backup ID detection
  const pathId = typeof window !== "undefined" ? window.location.pathname.split('/').pop() : null;
  const id = params.id || pathId;

  const isEmbed = typeof window !== "undefined" && window.location.search.includes("embed=1");

  const { data: widget, isLoading } = useQuery({
    queryKey: ["widget", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("widgets").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Remove website styling if in embed mode
  useEffect(() => {
    if (isEmbed) {
      document.documentElement.style.backgroundColor = "transparent";
      document.body.style.backgroundColor = "transparent";
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = "transparent";
    }
  }, [isEmbed]);

  if (isLoading) return null;
  if (!widget) return <div className="p-10 text-center font-serif">Widget not found.</div>;

  // We wrap the user's HTML in a full document structure so scripts run correctly
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
          /* Ensure the widget content fills the area */
          #widget-container { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="widget-container">
          ${widget.html}
        </div>
      </body>
    </html>
  `;

  // VIEW 1: THE NOTION EMBED (Interactive Iframe)
  if (isEmbed) {
    return (
      <iframe
        srcDoc={fullHtml}
        title={widget.name}
        style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
        sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      />
    );
  }

  // VIEW 2: THE WEBSITE PAGE
  const embedUrl = `${window.location.origin}/v/${widget.id}?embed=1`;

  return (
    <div className="min-h-screen p-6 md:p-20 bg-[#F5F5DC]">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-stone-400 hover:text-black transition">← Back to Gallery</a>
        <h1 className="text-4xl font-serif mt-6 mb-2">{widget.name}</h1>
        <p className="text-stone-500 mb-10 italic">Created on {new Date(widget.created_at).toLocaleDateString()}</p>
        
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-10">
            <div className="p-4 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400">Interactive Preview</div>
            <div style={{ height: '400px', width: '100%' }}>
                <iframe
                    srcDoc={fullHtml}
                    title="preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                />
            </div>
        </div>

        <div className="bg-white/50 border border-stone-200 p-8 rounded-2xl">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Notion Embed Link</h3>
          <p className="text-sm text-stone-600 mb-4">Copy this link, paste into Notion, and select <strong>"Create Embed"</strong>.</p>
          <code className="block text-[10px] bg-white border border-stone-200 p-4 rounded-lg break-all select-all">
            {embedUrl}
          </code>
        </div>
      </div>
    </div>
  );
}
