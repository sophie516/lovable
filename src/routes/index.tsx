import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const { data: widgets, isLoading } = useQuery({
    queryKey: ["widgets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("widgets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#333] flex flex-col font-sans">
      <header className="max-w-6xl mx-auto w-full px-6 py-10 flex justify-between items-center">
        <h1 className="text-3xl font-serif tracking-tighter">Widgetry</h1>
        <div className="space-x-6 flex items-center">
          {user ? (
             <button onClick={() => supabase.auth.signOut()} className="text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-black">Sign Out</button>
          ) : (
             <Link to="/auth" className="text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-black">Sign In</Link>
          )}
          <Link to="/create" className="bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition">Create Widget</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-serif text-stone-800 leading-tight">Minimalist widgets<br/>for your Notion.</h2>
          <p className="text-stone-500 mt-6 max-w-lg mx-auto italic font-serif text-lg">"Beauty is the elimination of the superfluous."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {widgets?.map((w: any) => (
            <div key={w.id} className="group cursor-pointer">
              <div className="aspect-[4/3] bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                 <iframe srcDoc={w.html} sandbox="allow-scripts" className="w-full h-full border-0 pointer-events-none" />
              </div>
              <div className="mt-4 flex justify-between items-center px-2">
                <h3 className="font-medium text-stone-700">{w.name}</h3>
                <Link to={`/v/${w.id}`} className="text-xs text-stone-400 hover:text-black underline">View Embed</Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
