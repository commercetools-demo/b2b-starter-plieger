import Link from "next/link";
import { iProjectInfo } from "@/types/project";

interface AddressBentoProps {
    id: string;
    projectInfo: iProjectInfo | null;
}

export default function AddressBento({ id, projectInfo }: AddressBentoProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-lg">location_on</span>
                    <h3 className="font-bold text-lg">Bouwadres</h3>
                </div>
                <p className="text-on-surface font-semibold">{projectInfo?.constructionAddress?.street || 'Nog niet ingesteld'}</p>
                <p className="text-on-surface-variant">{projectInfo?.constructionAddress?.zip} {projectInfo?.constructionAddress?.city}</p>
                <div className="mt-4 pt-4 border-t border-surface-container-low">
                    <span
                        className="text-xs font-bold text-primary uppercase tracking-tighter cursor-pointer hover:underline flex items-center gap-1">Bekijk
                        op kaart <span className="material-symbols-outlined text-xs">arrow_outward</span></span>
                </div>
            </div>
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-lg">person_pin_circle</span>
                    <h3 className="font-bold text-lg">Klant Adres</h3>
                </div>
                <p className="text-on-surface font-semibold">{projectInfo?.clientAddress?.street || 'Nog niet ingesteld'}</p>
                <p className="text-on-surface-variant">{projectInfo?.clientAddress?.zip} {projectInfo?.clientAddress?.city}</p>
                <div className="mt-4 pt-4 border-t border-surface-container-low">
                    <span
                        className="text-xs font-bold text-primary uppercase tracking-tighter cursor-pointer hover:underline flex items-center gap-1">Bekijk
                        op kaart <span className="material-symbols-outlined text-xs">arrow_outward</span></span>
                </div>
            </div>
            <div className="md:col-span-2 p-6 bg-surface-container-low rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">add_location</span>
                        <h3 className="font-bold">Aanvullende adressen</h3>
                    </div>
                    <Link href={`/dashboard/projecten/${id}/adressen`} className="text-xs font-bold text-primary">Beheren</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectInfo?.additionalAddresses?.length ? (
                        projectInfo.additionalAddresses.map((addr) => (
                            <div key={addr.id} className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm mt-1 text-on-surface-variant">warehouse</span>
                                <div>
                                    <p className="text-xs font-bold">{addr.label}</p>
                                    <p className="text-xs text-on-surface-variant">{addr.street}, {addr.city}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-on-surface-variant col-span-2 italic">Geen aanvullende adressen</p>
                    )}
                </div>
            </div>
        </section>
    );
}
