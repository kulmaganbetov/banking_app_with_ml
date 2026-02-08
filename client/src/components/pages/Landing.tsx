import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "⚡",
    title: "Fast Transfers",
    desc: "Send money instantly across Kazakhstan with zero delays.",
  },
  {
    icon: "🔒",
    title: "Secure Transactions",
    desc: "Bank-grade encryption protects every transaction you make.",
  },
  {
    icon: "🤖",
    title: "AI Protection",
    desc: "Real-time ransomware detection powered by machine learning.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SecureBank</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-full">
            AI-Powered Security Active
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto">
            Secure Online Banking with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Protection
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
            Next-generation banking platform with built-in machine learning
            ransomware detection. Your money, protected in real time.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors"
            >
              Access Dashboard
            </button>
            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              viewport={{ once: true }}
              className="glass p-6"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-white/5 text-center text-xs text-gray-500">
        SecureBank &copy; {new Date().getFullYear()} &mdash; AI-Protected Banking Platform
      </footer>
    </div>
  );
}
