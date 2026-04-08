import Link from "next/link";

interface ProjectPeopleProps {
    id: string;
    variant?: 'snippet' | 'full';
}

export default function ProjectPeople({ id, variant = 'snippet' }: ProjectPeopleProps) {
    const people = [
        {
            name: "Mark de Beer",
            role: "Loodgieter",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6zZMLXjj1qEYmF9c-oCjJEuwcLfj5dftFKD3Lu8G4mJ806ZqMEvFIhAWfPcq5kMEOK6t_4PCJeAmTKlccq2X8NHclrSPef9xz2n0Rg9g52WaVVmmUPXfl_hY-jNbmGR5_VbmQleuhsxDoRvSP8aYI2ynBM4KGLPO3gKHIJRqYfMp0Ky3PI1kChEFy0d5Wu7I0_xDAt87M9jctvUmc06DQa2-YmvyWLIxjTLR-LuSivdFVQlfnFmfW6ARI_827cVIcV8nOShRlia-B"
        },
        {
            name: "Sara Visser",
            role: "Loodgieter",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBycqjsVv_4o3j86Vd69R8MnaBVWymCIh0vYsDRcxZMB56OJ5ZPb50yNl1Bz8zdNaBaNVC57d19LxSKyJkdd_gPYe5-uLWlnyw6fLwKsFExB4ZPUYnRmm1KlfCCgax8pRNcqkcpJawifaT-ZX16BDO9BcDfbA0voSNz2WfyhZuz76BotVytasKnW7KdBGBvhxgFg74mAFX9sIJlr-dr8oeYeVi9I0NnUqLc1fMUArqmRKn0wtFemXVaXA4fyI74olmFRhWCMzKEHHDz"
        }
    ];

    if (variant === 'full') {
        return (
            <section
                className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
                <div className="p-6 border-b border-surface-container-low flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2"><span
                        className="material-symbols-outlined text-primary">groups</span> Mensen</h3>
                    <Link href={`/dashboard/projecten/${id}/edit`}
                        className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors"
                    >person_add</Link>
                </div>
                <div className="divide-y divide-surface-container-low grid grid-cols-1 md:grid-cols-2">
                    {people.map((person, i) => (
                        <div key={i} className={`p-4 hover:bg-surface-container-low/50 transition-colors ${i % 2 === 0 ? 'md:border-r border-surface-container-low' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden">
                                    <img className="object-cover w-full h-full"
                                        alt={person.name}
                                        src={person.img} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-on-surface">{person.name}</p>
                                    <p className="text-xs text-on-surface-variant">{person.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-surface-container-low flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><span
                    className="material-symbols-outlined text-primary">groups</span> Mensen</h3>
                <Link href={`/dashboard/projecten/${id}/edit`}
                    className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors"
                >person_add</Link>
            </div>
            <div className="divide-y divide-surface-container-low">
                {people.slice(0, 1).map((person, i) => (
                    <div key={i} className="p-4 hover:bg-surface-container-low/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden">
                                <img className="object-cover w-full h-full"
                                    alt={person.name}
                                    src={person.img} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-on-surface">{person.name}</p>
                                <p className="text-xs text-on-surface-variant">{person.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-surface-container-low/30 text-center">
                <button className="text-xs font-bold text-primary hover:underline">Bekijk alle projectleden (12)</button>
            </div>
        </section>
    );
}
