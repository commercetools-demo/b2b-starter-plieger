'use client';

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { usePurchaseListMutations, usePurchaseLists } from "@/hooks/usePurchaseLists";
import { useState, useEffect } from "react";
import { iProjectInfo } from "@/types/project";

export interface ProjectFormData {
    name: string;
    description: string;
    projectInfo: iProjectInfo;
}

const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    projectInfo: {
        referenceCode: '',
        contactPerson: '',
        companyName: '',
        address: '',
        city: '',
        zipCode: '',
        startDate: '',
        endDate: '',
    }
};

export function useProjectActions() {
    const { addToast } = useToast();
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { createList, deleteList } = usePurchaseListMutations();
    const { data, isLoading } = usePurchaseLists();
    const lists = data?.results ?? [];

    const handleCreate = async (formData: ProjectFormData) => {
        if (!formData.name.trim()) return;
        setCreating(true);
        try {
            // For now, only the name is used in the createList call
            // until the API supports the full metadata
            await createList(formData.name.trim(), formData.description.trim(), formData.projectInfo);
            addToast('Project aangemaakt');
            setCreateOpen(false);
        } catch {
            addToast('Fout bij het aanmaken van het project');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        const list = lists.find((l: any) => l.id === id);
        if (!list) return;
        setDeletingId(id);
        try {
            await deleteList(id, list.version);
            addToast('Projectlijst verwijderd');
        } catch {
            addToast('Projectlijst kan niet worden verwijderd');
        } finally {
            setDeletingId(null);
        }
    };

    return {
        createOpen,
        setCreateOpen,
        creating,
        deletingId,
        handleCreate,
        handleDelete,
        lists,
        isLoading
    };
}

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProjectFormData) => void;
    saving: boolean;
}

export function CreateModal({
    isOpen,
    onClose,
    onSave,
    saving,
}: CreateModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const handleChange = (field: 'name' | 'description', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleInfoChange = (field: keyof ProjectFormData['projectInfo'], value: string) => {
        setFormData(prev => ({
            ...prev,
            projectInfo: {
                ...prev.projectInfo,
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Maak een project Lijst"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Annuleren</Button>
                    <Button variant="primary" loading={saving} onClick={() => onSave(formData)}>Project Aanmaken</Button>
                </>
            }
        >
            <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Project Core Data */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-4">
                        <span className="material-symbols-outlined text-base">info</span> Kerninformatie
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Projectnaam</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="bijv. De Vries Renovatie"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Referentiecode</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="PRJ-2024-001"
                                type="text"
                                value={formData.projectInfo.referenceCode}
                                onChange={(e) => handleInfoChange('referenceCode', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Omschrijving</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="Wat moet het precies gaan worden"
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                    </div>
                </section>
                {/* Client Details */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-4">
                        <span className="material-symbols-outlined text-base">person</span> Klantspecificaties
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Contactpersoon</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="Volledige naam"
                                type="text"
                                value={formData.projectInfo.contactPerson}
                                onChange={(e) => handleInfoChange('contactPerson', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Bedrijfsnaam</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="Organisatienaam"
                                type="text"
                                value={formData.projectInfo.companyName}
                                onChange={(e) => handleInfoChange('companyName', e.target.value)}
                            />
                        </div>
                    </div>
                </section>
                {/* Address Information */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-4">
                        <span className="material-symbols-outlined text-base">location_on</span> Hoofdafleveradres
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Straat &amp; Huisnummer</label>
                            <Input
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                placeholder="123 Industrial Way"
                                type="text"
                                value={formData.projectInfo.address}
                                onChange={(e) => handleInfoChange('address', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Stad</label>
                                <Input
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                    placeholder="Rotterdam"
                                    type="text"
                                    value={formData.projectInfo.city}
                                    onChange={(e) => handleInfoChange('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Postcode</label>
                                <Input
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background placeholder:text-outline-variant transition-all"
                                    placeholder="3011 AA"
                                    type="text"
                                    value={formData.projectInfo.zipCode}
                                    onChange={(e) => handleInfoChange('zipCode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
                {/* Deadlines */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-4">
                        <span className="material-symbols-outlined text-base">event</span> Projectplanning
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Startdatum</label>
                            <div className="relative">
                                <Input
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background transition-all"
                                    type="date"
                                    value={formData.projectInfo.startDate}
                                    onChange={(e) => handleInfoChange('startDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Verwachte Oplevering</label>
                            <div className="relative">
                                <Input
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-background transition-all"
                                    type="date"
                                    value={formData.projectInfo.endDate}
                                    onChange={(e) => handleInfoChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </Modal>
    );
}
