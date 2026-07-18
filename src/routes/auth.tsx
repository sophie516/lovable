import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) alert(error.message); else window.location.href = "/";
  };
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) alert(error.message); else alert("Check email!");
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80 space-y-4">
        <h2 className="text-xl font-serif">Join Widgetry</h2>
        <input className="w-full border p-2 rounded" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-stone-800 text-white py-2 rounded-full">Login</button>
        <button onClick={handleSignup} className="w-full text-stone-400 text-xs">Create Account</button>
      </div>
    </div>
  );
}
