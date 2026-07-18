import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/v/$id")({ component: WidgetView });

function WidgetView() {
  // 1. Try to get the ID from the URL path manually as a backup
  const pathId = typeof window !== "undefined" ? window.location.pathname.split('/').pop() : null;
  
  // 2. Try to get ID from the Router
  const params = Route.useParams();
  const id = params.id || pathId;

  const isEmbed = typeof window !== "undefined" && window.location.search.includes("embed=1");

  const { data: widget, isLoading, error } = useQuery({
    queryKey: ["widget", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // THE CSS HACK: Remove ALL backgrounds if it's an embed
  useEffect(() => {
    if (isEmbed) {
      document.documentElement.style.backgroundColor = "transparent";
      document.body.style.backgroundColor = "transparent";
      document.body.style.backgroundImage = "none";
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = "transparent";
    }
  }, [isEmbed]);

  if (isLoading) return null;

  // If query finished and no widget found
  if (!widget) {
    return (
      <div className="p-10 text-center font-serif">
        <p>Widget not found.</p>
        <p className="text-xs text-stone-400 mt-2">ID: {id}</p>
        {!isEmbed && <a href="/" className="underline mt-4 block">Back to Gallery</a>}
      </div>
    );
  }

  // VIEW 1: RAW EMBED FOR NOTION
  if (isEmbed) {
    return (
      <div 
        style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }} 
        dangerouslySetInnerHTML={{ __html: widget.html }} 
      />
    );
  }

  // VIEW 2: NORMAL WEBSITE PAGE
  const embedUrl = `${window.location.origin}/v/${widget.id}?embed=1`;

  return (
    <div className="min-h-screen p-6 md:p-20 bg-[#F5F5DC]">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-stone-400 hover:text-black transition">← Back to Gallery</a>
        <h1 className="text-4xl font-serif mt-6 mb-2">{widget.name}</h1>
        <p className="text-stone-500 mb-10 italic">Created on {new Date(widget.created_at).toLocaleDateString()}</p>
        
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-10">
            <div className="p-4 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400">Live Preview</div>
            <div className="p-4" style={{ minHeight: '300px' }}>
                <div dangerouslySetInnerHTML={{ __html: widget.html }} />
            </div>
        </div>

        <div className="bg-white/50 border border-stone-200 p-8 rounded-2xl">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Notion Link</h3>
          <p className="text-sm text-stone-600 mb-4">Copy this link and paste it into Notion. Select <strong>"Create Embed"</strong>.</p>
          <code className="block text-[10px] bg-white border border-stone-200 p-4 rounded-lg break-all select-all">
            {embedUrl}
          </code>
        </div>
      </div>
    </div>
  );
}
