import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Network, ShieldAlert, HeartPulse, Cpu, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const navigate = useNavigate();

  // Parallax and fade effects
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const features = [
    {
      icon: <Network className="w-8 h-8 text-cyan-400" />,
      title: "Real-Time Triangulation",
      description: "Our proprietary Overpass routing engine actively triangulates your exact GPS node against thousands of live medical centers, delivering the fastest possible extraction route."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-emerald-400" />,
      title: "Automated Emergency Broadcasting",
      description: "We bypass standard hold times by directly broadcasting your encrypted AI-generated symptoms to emergency room dispatcher terminals within a 5km radius."
    },
    {
      icon: <Cpu className="w-8 h-8 text-blue-400" />,
      title: "AI Symptom Analysis",
      description: "Powered by advanced NLP, our medical chatbot instantly categorizes your emergency urgency (Low to Critical) before you even arrive at the facility."
    }
  ];

  const stats = [
    { value: "0.4s", label: "Routing Latency" },
    { value: "99.9%", label: "Uptime" },
    { value: "500+", label: "Linked Hospitals" },
    { value: "24/7", label: "Active Monitoring" }
  ];

  return (
    <div ref={containerRef} className="bg-black min-h-screen text-white pt-20 overflow-hidden relative">
      
      {/* Dynamic Background Element */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-20 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-black to-black"></div>
        {/* Hexagon Grid Pattern Overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            style={{ opacity: opacityFade }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8 backdrop-blur-sm"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">Mission Protocol</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500">Emergency</span> Infrastructure.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light mx-auto max-w-2xl mb-12">
            NearMeds was created with a simple goal: to make finding medical help during emergencies fast and easy. Don't wait. Find care now.
          </p>

          <button 
             onClick={() => navigate('/find-meds')}
             className="group relative inline-flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] overflow-hidden"
          >
             <span className="relative z-10 flex items-center gap-2">
               Find Nearby Meds <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </span>
             {/* Button shine effect */}
             <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 bg-zinc-900/50 border-y border-white/5 backdrop-blur-md py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-black/40 border border-white/10 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors group"
              >
                <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section with parallax */}
      <div className="relative z-10 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-white/10 border border-white/10 rounded-3xl p-8 bg-black/60 backdrop-blur-lg"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Tailwind custom animation config needed for the button shine */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default AboutPage;
