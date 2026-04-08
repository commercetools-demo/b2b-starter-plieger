export default function ProjectTimeline() {
    return (
        <section
            className="p-6 bg-primary rounded-xl shadow-xl shadow-primary/20">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                <span className="material-symbols-outlined">schedule</span>
                Project Tijdlijn
            </h3>
            <div className="space-y-6">
                <div className="relative pl-6 border-l border-white/30">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-white shadow-sm"></div>
                    <p className="text-[10px] uppercase font-bold text-white/70">Project Start</p>
                    <p className="font-bold text-white">Maandag, 12 Juni 2026</p>
                </div>
                <div className="relative pl-6 border-l border-white/30">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-white shadow-sm"></div>
                    <p className="text-[10px] uppercase font-bold text-white/70">Installation venster</p>
                    <p className="font-bold text-white">11 Juni — 21 Juni 2026</p>
                </div>
                <div className="relative pl-6 border-l border-white/30">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm"></div>
                    <p className="text-[10px] uppercase font-bold text-white/70">Opleverdatum</p>
                    <p className="font-bold text-lg text-white">10 Juli 2026</p>
                </div>
            </div>
        </section>
    )
}
