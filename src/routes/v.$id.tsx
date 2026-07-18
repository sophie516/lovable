import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/v/$id")({ component: WidgetView });

function WidgetView() {
  const { id } = useParams({ from: '/v/$id' });
  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "1";

  const { data: widget } = useQuery({
    queryKey: ["widget", id],
    queryFn: async () => {
      const { data } = await supabase.from("widgets").select("*").eq("id", id).single();
      return data;
    },
  });

  if (!widget) return null;

  // If Notion is looking at this (?embed=1), show ONLY the widget, no website bars!
  if (isEmbed) {
    return <div dangerouslySetInnerHTML={{ __html: widget.html }} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-10">
      <h1 className="text-2xl font-serif">{widget.name}</h1>
      <div className="mt-4 p-4 border bg-white rounded-xl">
        <div dangerouslySetInnerHTML={{ __html: widget.html }} />
      </div>
      <div className="mt-8 p-4 bg-stone-100 rounded-lg">
        <p className="text-sm">Copy this link to Notion:</p>
        <code className="text-xs">{window.location.origin}/v/${id}?embed=1</code>
      </div>
    </div>
  );
}
