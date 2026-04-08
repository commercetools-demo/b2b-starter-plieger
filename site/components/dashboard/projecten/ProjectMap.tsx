export default function ProjectMap() {
    return (
        <section className="h-48 rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 relative">
            <img className="object-cover w-full h-full"
                alt="Map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgkLY7cbl-segp8Z_41noZZP-kNFFLGMDAMT5ytGVyIu6dflvbC-VNts8cUy4c7DFgaVC9-exzVVomE3ax94aFd2KSv8dtbgez72Vd4VLnL9mRZYNJd6n6gVRpgOuS3HyK6Qq0dyzQ2dcNoT1IdzFxEbZpge0BSo17HLC5p-34Vb051-0gp57kD2TBYUJ3SFZpoHw4xnejFrtQzDEHPYiQ03O4ymv5R8Mdfjx7n7muQMdxxcqieOumjz_YWERQy86SZZvqzO_Pgywv" />
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-surface-container-lowest p-3 rounded-full shadow-lg border border-primary/20">
                    <span className="material-symbols-outlined text-primary" data-weight="fill">location_on</span>
                </div>
            </div>
            <div
                className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">
                Utrecht, Fase 1 Gebied</div>
        </section>
    )
}
