'use client';

import { useToast } from "@/context/ToastContext";
import { usePurchaseList } from "@/hooks/usePurchaseLists";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Address } from "@commercetools/platform-sdk";
import { Select } from "@/components/ui/Select";
import { iProjectInfo } from "@/types/project";
import { useRouter } from "next/navigation";




export default function AdressenPage() {

    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { addToast } = useToast();
    const locale = useLocale()
    const localePath = `/${locale}`
    const { data: list, isLoading } = usePurchaseList(id);
    const [projectInfo, setProjectInfo] = useState<iProjectInfo | null>(null);
    const [adressen, setAdressen] = useState<Address[]>([]);
    useEffect(() => {
        if (!isLoading && list && list.custom) {
            if (!list.custom.fields.adressen) {
                setAdressen([]);
                return;
            }
            const addr = JSON.parse(list.custom.fields.adressen as string) as Address[];
            setAdressen(addr);
            const projectInfo = JSON.parse(list.custom.fields.projectInfo as string) as iProjectInfo;
            setProjectInfo(projectInfo);
        }
    }, [isLoading, list]);
    const handleBackClick = () => {
        router.back();
    }

    return (
        <div>
            <div className="px-8 py-6 flex justify-between items-center bg-surface-container-lowest border-b border-outline-variant/10">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-on-surface">Bewerk Adressen</h2>
                    <p className="text-sm text-on-surface-variant font-medium">Beheer de logistiek en aflever adressen voor project {projectInfo?.referenceCode}</p>
                </div>
            </div>
            {/* Modal Content (Two-Column Asymmetric) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Address List */}
                <div
                    className="w-2/5 border-r border-outline-variant/10 bg-surface-container-low/30 overflow-y-auto custom-scrollbar p-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Opgeslagen Adressen</span>
                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">add</span>Nieuw Adres
                        </button>
                    </div>
                    <div className="space-y-4">
                        {/* Address Card: Building */}
                        <div
                            className="group relative bg-surface-container-lowest p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-l-4 border-primary transition-all hover:shadow-md cursor-pointer">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary" data-weight="fill">domain</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-on-surface text-sm">Hoofdbouwplaats</h4>
                                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">High Tech Campus 5<br />5656 AE,
                                        Eindhoven</p>
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            className="text-[10px] font-bold uppercase tracking-tighter text-primary/80 hover:text-primary">Bewerk details</button>
                                        <button
                                            className="text-[10px] font-bold uppercase tracking-tighter text-error/80 hover:text-error">Verwijderen</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Address Card: Client */}
                        <div
                            className="group relative bg-surface-container-lowest/60 p-4 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary">business_center</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-on-surface text-sm">Hoofdkantoors</h4>
                                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Strijp-S, Veemgebouw 4<br />5617 AZ,
                                        Eindhoven</p>
                                    <div className="mt-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] font-bold uppercase tracking-tighter text-primary/80">Bewerk details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Address Card: Storage */}
                        <div
                            className="group relative bg-surface-container-lowest/60 p-4 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary">warehouse</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-on-surface text-sm">Opslaglocatie</h4>
                                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Industrial Park North 12<br />5691 GE,
                                        Son</p>
                                    <div className="mt-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] font-bold uppercase tracking-tighter text-primary/80">Bewerk details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column: Edit Form */}
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-on-surface">Adres Details</h3>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest">Bewerken</span>
                        </div>
                    </div>
                    <form className="space-y-8">
                        {/* Address Type Selection */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 transition-all"
                                type="button">
                                <span className="material-symbols-outlined text-primary mb-2">domain</span>
                                <span className="text-xs font-bold text-primary">Bouwplaats</span>
                            </button>
                            <button
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all"
                                type="button">
                                <span className="material-symbols-outlined mb-2">business_center</span>
                                <span className="text-xs font-medium">Klant</span>
                            </button>
                            <button
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all"
                                type="button">
                                <span className="material-symbols-outlined mb-2">warehouse</span>
                                <span className="text-xs font-medium">Opslag</span>
                            </button>
                        </div>
                        {/* Form Grid */}
                        <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                            <div className="col-span-12">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Straatnaam</label>
                                <Input
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="e.g. Main Street" type="text" value="High Tech Campus"
                                    onChange={(e) => setAdressen(adressen.map((a) => a.streetName === e.target.value ? { ...a, streetName: e.target.value } : a))} />
                            </div>
                            <div className="col-span-4">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Huisnummer</label>
                                <Input
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="123" type="text" value="5"
                                    onChange={(e) => setAdressen(adressen.map((a) => a.streetNumber === e.target.value ? { ...a, number: e.target.value } : a))} />
                            </div>
                            <div className="col-span-8">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Toevoeging</label>
                                <Input
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="Floor 2, Suite 4" type="text" value="Building A"
                                    onChange={(e) => setAdressen(adressen.map((a) => a.additionalStreetInfo === e.target.value ? { ...a, addition: e.target.value } : a))} />
                            </div>
                            <div className="col-span-5">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Postcode</label>
                                <Input
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="1000 AA" type="text" value="5656 AE" onChange={(e) => setAdressen(adressen.map((a) => a.postalCode === e.target.value ? { ...a, postalCode: e.target.value } : a))} />
                            </div>
                            <div className="col-span-7">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Plaats</label>
                                <Input
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="Amsterdam" type="text" value="Eindhoven"
                                    onChange={(e) => setAdressen(adressen.map((a) => a.city === e.target.value ? { ...a, city: e.target.value } : a))} />
                            </div>
                            <div className="col-span-12">
                                <label
                                    className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Land</label>
                                <Select
                                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                                    options={[
                                        { value: 'NL', label: 'Netherlands' },
                                        { value: 'BE', label: 'Belgium' },
                                        { value: 'DE', label: 'Germany' },
                                        { value: 'GB', label: 'United Kingdom' },
                                    ]}
                                    value={adressen[0].country}
                                    onChange={(e) => setAdressen(adressen.map((a) => a.country === e.target.value ? { ...a, country: e.target.value } : a))} />


                            </div>
                        </div>
                        {/* Map Preview Section */}
                        <div className="relative mt-8 group">
                            <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm group-hover:bg-primary/20 transition-all">
                            </div>
                            <div
                                className="relative bg-surface-container-highest h-48 rounded-xl overflow-hidden flex items-center justify-center">
                                <img className="w-full h-full object-cover opacity-60"
                                    data-alt="Modern minimalist digital map interface showing urban street grid with blue location marker pin on a clean grey background"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWFdQeDrc25zjWlGOjotcS4OO3FVSCpwEHOGiVCcux7TECzGsml2sK4KDquy4D0rY9JMRal-cG1A287Ul0fFlGMO2mdlDBu2pEU_m93dadSlI3iuxBbcwJ-xk5-C_vvoOEeOC1mykdArpYWGY7Xz6_cKlacO45TvFeD6L0NGubKnGQGwFM7hyl22tXhqXwB51IaFLpgPtm0YVQqqvCc860tBchR15Qpm7rQ3VeFFvIdzy7p125QobbBCL28v0I9HndGSHr7WRmFV56" />
                                <div className="absolute flex flex-col items-center">
                                    <div
                                        className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <span className="material-symbols-outlined text-white">location_on</span>
                                    </div>
                                    <span
                                        className="mt-2 text-[10px] font-black uppercase tracking-tighter text-on-surface bg-white/90 px-3 py-1 rounded-full shadow-sm">Gecontroleerde locatie</span>
                                </div>
                            </div>
                            <button
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-[10px] font-bold text-on-surface-variant px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all"
                                type="button">
                                Aanpassen op de kaart
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Modal Footer */}
            <div className="px-8 py-6 bg-surface-container-low/50 flex justify-end items-center gap-4">
                <a className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-primary-light text-primary transition-all"
                    onClick={handleBackClick}>
                    Annuleren
                </a>
                <a className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg hover:translate-y-[-1px] active:scale-95 transition-all"
                    onClick={handleBackClick}>
                    Bewaren
                </a>
            </div>
        </div>
    )
}