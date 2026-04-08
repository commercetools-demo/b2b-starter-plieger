interface ItemCollectionsProps {
    activeTab: 'info' | 'collections' | 'people';
    onViewAll: () => void;
}

export default function ItemCollections({ activeTab, onViewAll }: ItemCollectionsProps) {
    return (
        <section
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="p-6 border-b border-surface-container-low flex items-center justify-between">
                <h3 className="font-bold text-xl flex items-center gap-2"><span
                    className="material-symbols-outlined text-primary">category</span> Itemcollecties</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-surface-container-high rounded-full">8 Items Totaal</span>
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
                            <tr className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="py-4 px-2 font-bold">2x</td>
                                <td className="py-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden">
                                            <img className="object-cover w-full h-full"
                                                alt="Plieger Roma"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCcuFgjyV9DcCiNKAIouxjHZF9JzoA8JfDIEGAa-mUur1ty30iHvF4hYtxn6zZk3Chs9dVXmKfleMDZ-ic0adCXo1HA_NpEkwNv8Y1J5Ym8WzVQK3aWEXmLpPPnuL6FArpOVzONYASB_t71FEvax0RCtVzPzuIQUf4WOtZL-zpSNjFQ83RicKJ0RX6q0KfH3_uFlKPOIH2LZ1IlG4wn2E0jdgluX_tepADR8suBbb9fRvxKSKKTzjIsJK8tdURZ56uuXs1IG4dxMti" />
                                        </div>
                                        <span className="font-semibold text-xs leading-tight">Plieger Roma Washbasin Faucet Chrome</span>
                                    </div>
                                </td>
                                <td className="py-4 px-2">
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600"><span
                                        className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Op voorraad</span>
                                </td>
                                <td className="py-4 px-2 text-on-surface-variant text-xs">12 Oct 2024</td>
                                <td className="py-4 px-2">
                                    <span
                                        className="text-[10px] uppercase font-black px-2 py-0.5 bg-primary/10 text-primary rounded">Verzonden</span>
                                </td>
                                <td className="py-4 px-2 text-xs font-medium">BOUW-01</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
