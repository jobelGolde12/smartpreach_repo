import { Search, Monitor, Lightbulb, Globe, Smartphone, Mic } from "lucide-react";

export default function WelcomeFeatures() {
  const features = [
    {
      title: "Live Verse Search",
      desc: "Instantly find Bible verses by keyword or reference.",
      icon: Search
    },
    {
      title: "Verse Display Screen",
      desc: "Large, elegant verse presentation for services.",
      icon: Monitor
    },
    {
      title: "Suggestion Panel",
      desc: "Quick access to recent, favorite, and suggested verses.",
      icon: Lightbulb
    },
    {
      title: "Bible API Integration",
      desc: "Powered by reliable KJV scripture sources.",
      icon: Globe
    },
    {
      title: "Responsive Design",
      desc: "Perfect on desktop, tablet, and mobile.",
      icon: Smartphone
    },
    {
      title: "Voice Recognition",
      desc: "Hands-free verse searching during preaching.",
      icon: Mic
    },
  ];

  return (
    <section id="features" className="container mx-auto px-6 py-24">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h3 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
          Designed for Modern Ministry
        </h3>
        <p className="text-slate-500 text-lg">
          Powerful tools engineered for clarity and focus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
            >
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Icon size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">
                {feature.title}
              </h4>
              <p className="text-slate-500 leading-relaxed flex-grow">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}