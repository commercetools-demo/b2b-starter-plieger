import Link from "next/link"

interface ProjectHeaderProps {
    name: string;
    id: string;
}

export default function ProjectHeader({ name, id }: ProjectHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black tracking-widest uppercase px-2 py-1 bg-green-100 text-green-700 rounded-md">In Opdracht</span>
                    <span className="text-xs font-bold text-on-surface-variant">#PRJ-{id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h1 className="text-4xl font-black text-on-surface tracking-tight">{name}</h1>
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/dashboard/projecten/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all text-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Aanpassen
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all text-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-lg">share</span>
                    Delen
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-xl font-bold hover:opacity-90 transition-all text-sm shadow-lg shadow-error/20">
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Verwijder
                </button>
            </div>
        </header>
    )
}
