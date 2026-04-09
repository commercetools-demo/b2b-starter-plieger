import { PurchaseList } from "@/lib/types";
import { useFormatters } from "@/hooks/useFormatters";
import { Seed } from "@/lib/seed";


interface ItemCollectionsProps {
    activeTab: 'info' | 'collections' | 'people';
    list: PurchaseList
    onViewAll: () => void;
}

export default function ItemCollections({ activeTab, list, onViewAll }: ItemCollectionsProps) {
    const { localizedString } = useFormatters();
    const levertijd = [{text: "op voorraad", color: "green"}, {text: "geleverd", color: "green"}, {text: "besteld", color: "green"}, {text: "onderweg", color: "green"}, {text: "niet leverbaar", color: "red"}]
    const status = [{text: "verzonden", color: "green"}, {text: "geleverd", color: "green"}, {text: "besteld", color: "green"}, {text: "onderweg", color: "yellow"}, {text: "niet leverbaar", color: "red"}]
    const leverdatum = ["12 Jun 2026", "16 Jun 2026", "18 Jun 2026", "20 Jun 2026", "22 Jun 2026"]
    console.log(list)
    return (
        <section
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="p-6 border-b border-surface-container-low flex items-center justify-between">
                <h3 className="font-bold text-xl flex items-center gap-2"><span
                    className="material-symbols-outlined text-primary">category</span> Itemcollecties</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-surface-container-high rounded-full">{list.lineItems.length} Items Totaal</span>
                    {activeTab === 'info' && (
                        <button
                            onClick={onViewAll}
                            className="text-xs font-bold text-primary hover:underline"
                        >Bekijk alle</button>
                    )}
                </div>
            </div>
            {/* Collection Group: Sanitary */}
            <div className="p-4 bg-surface-container-low/30">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                    <span className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Sanitair
                        Collectie</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-on-surface-variant font-bold border-b border-surface-container-low">
                                <th className="py-3 px-2">Aantal</th>
                                <th className="py-3 px-2">Item</th>
                                <th className="py-3 px-2">Voorraad</th>
                                <th className="py-3 px-2">Leverdatum</th>
                                <th className="py-3 px-2">Status</th>
                                <th className="py-3 px-2">Locatie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {list.lineItems.map((lineItem) => {
                                const seed = Seed(lineItem)
                                const {text: lt, color: lc} = seed.pick(levertijd)
                                const {text: st, color: sc} = seed.pick(status)
                                const image = lineItem.variant.images?.[0];
                                const name = localizedString(lineItem.name);
                                return (
                                    <tr key={lineItem.id} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-4 px-2 font-bold">{lineItem.quantity}x</td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
                                                    {image ? (
                                                        <img className="object-cover w-full h-full"
                                                            alt={name}
                                                            src={image.url} />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-outline-variant/30 text-xl">image</span>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-xs leading-tight">{name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className={`flex items-center gap-1 text-xs font-bold text-${lc}-600`}>
                                                <span className={`w-1.5 h-1.5 rounded-full bg-${lc}-600`}></span> 
                                                {lt}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-on-surface-variant text-xs">{seed.pick(leverdatum)}</td>
                                        <td className="py-4 px-2">
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 bg-${sc}-100 text-${sc}-600 rounded`}>
                                                {st}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-xs font-medium">BOUW-01</td>
                                    </tr>   
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
