'use client';

import { Button } from "@/components/ui/Button";
import { CreateModal, useProjectActions } from "./createModal";
import { usePurchaseLists } from "@/hooks/usePurchaseLists";
import ProjectCard from "@/components/projecten/ProjectCard";


export default function ProjectsPage() {
    const { data, isLoading } = usePurchaseLists();
    const lists = data?.results ?? [];
    const {
        createOpen,
        setCreateOpen,
        creating,
        handleCreate,
        handleDelete,
    } = useProjectActions();
    
    return (
        <main className="min-h-screen transition-all duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Project lijsten</h1>
                    <p className="text-on-surface-variant text-md">Beheer uw inkoopsjablonen en projectassemblages.</p>
                </div>
                <Button variant="primary" onClick={() => setCreateOpen(true)}><span className="material-symbols-outlined">add_circle</span> Nieuwe Lijst Aanmaken</Button>
            </div>
            {/* Filter & Bulk Actions Bar */}
            <div className="bg-gray-50 p-8" >
                <div className="bg-white p-4 rounded-xl shadow-[0_24px_40px_rgba(0,14,94,0.04)] mb-8 flex flex-col lg:flex-row justify-between items-center gap-4">

                    <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <span className="text-xs font-bold text-outline uppercase mr-2 whitespace-nowrap">Bulkacties:</span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary-container rounded-lg text-xs font-bold text-on-secondary-container hover:bg-secondary-fixed transition-all whitespace-nowrap"><span className="material-symbols-outlined text-sm">shopping_cart</span> In Winkelwagen</button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary-container rounded-lg text-xs font-bold text-on-secondary-container hover:bg-secondary-fixed transition-all whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">download</span> CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-error-container rounded-lg text-xs font-bold text-on-error-container hover:bg-error/10 transition-all whitespace-nowrap"><span className="material-symbols-outlined text-sm">delete</span> Verwijder Geselecteerde</button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-error-container rounded-lg text-xs font-bold text-on-error-container hover:bg-error/10 transition-all whitespace-nowrap"><span className="material-symbols-outlined text-sm">content_copy</span> Kopieer</button>
                    </div>
                </div>
                {/* Purchase Lists Asymmetric Layout / Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
                    {/* Main Lists Table/Cards (xl-8) */}
                    <div className="xl:col-span-12 space-y-4">
                        {/* Column Headers */}
                        <div className="grid grid-cols-12 px-6 text-xs font-bold text-outline uppercase tracking-wider hidden lg:grid">
                            <div className="col-span-1"><input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" /></div>
                            <div className="col-span-4">Lijstnaam</div>
                            <div className="col-span-2 text-center">Items</div>
                            <div className="col-span-2 text-right">Waarde</div>
                            <div className="col-span-3 text-right">Laatst Bijgewerkt</div>
                        </div>
                        {/* List Item 1 */}
                        {!isLoading && lists.length === 0 ? (
                            <div className="text-center text-outline">Geen projecten gevonden</div>
                        ) : (
                            lists.map((shoppingList) => (
                                <ProjectCard key={shoppingList.id} shoppingList={shoppingList} />
                            ))
                        )}
                    </div>

                </div>
            </div>
            <CreateModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSave={handleCreate}
                saving={creating}
            />
        </main>

    )
}