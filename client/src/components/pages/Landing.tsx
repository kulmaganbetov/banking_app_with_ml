import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "⚡", title: "Fast Transfers", desc: "Send money instantly across Kazakhstan with zero delays." },
  { icon: "🔒", title: "Secure Transactions", desc: "Bank-grade encryption protects every transaction you make." },
  { icon: "🤖", title: "AI Protection", desc: "Real-time ransomware detection powered by machine learning." },
  { icon: "🏦", title: "Multiple Accounts", desc: "Manage checking and savings accounts from a single dashboard." },
  { icon: "📊", title: "Smart Analytics", desc: "Rule-based and AI behavioral analysis on every transaction." },
  { icon: "🛡️", title: "Threat Blocking", desc: "Automatic blocking of suspicious patterns and policy violations." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm sm:text-base">S</div>
          <span className="text-base sm:text-lg font-bold tracking-tight">Sentra Bank</span>
        </div>
        <button onClick={() => navigate("/login")}
          className="px-4 sm:px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
          Sign In
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 sm:py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-block px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-full">
            AI-Powered Security Active
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sentra Bank</span>
            <span className="block sm:inline">{" "}— Smart Banking Platform</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Next-generation banking with AI-powered ransomware detection, multi-account management, and real-time threat prevention.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => navigate("/login")}
              className="px-8 py-3 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors">
              Access Dashboard
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      <section id="features" className="px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }} viewport={{ once: true }} className="glass p-5 sm:p-6">
              <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{f.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="px-4 sm:px-8 py-5 sm:py-6 border-t border-white/5 text-center text-xs text-gray-500">
        Sentra Bank &copy; {new Date().getFullYear()} &mdash; Smart Banking Platform
      </footer>
    </div>
  );
}
