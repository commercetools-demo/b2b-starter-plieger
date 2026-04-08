'use client';

import { usePurchaseList } from "@/hooks/usePurchaseLists";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { iProjectInfo } from "@/types/project";

// Dashboard Components
import ProjectHeader from "@/components/dashboard/projecten/ProjectHeader";
import ProjectTabs from "@/components/dashboard/projecten/ProjectTabs";
import AddressBento from "@/components/dashboard/projecten/AddressBento";
import ItemCollections from "@/components/dashboard/projecten/ItemCollections";
import ProjectTimeline from "@/components/dashboard/projecten/ProjectTimeline";
import ProjectPeople from "@/components/dashboard/projecten/ProjectPeople";
import ProjectMap from "@/components/dashboard/projecten/ProjectMap";

export default function ProjectDetailPage() {
    const { id } = useParams() as { id: string };
    const { data: list, isLoading } = usePurchaseList(id);
    const [projectInfo, setProjectInfo] = useState<iProjectInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'collections' | 'people'>('info');

    useEffect(() => {
        if (!isLoading && list && list.custom) {
            try {
                if (list.custom.fields.projectInfo) {
                    const info = JSON.parse(list.custom.fields.projectInfo as string) as iProjectInfo;
                    setProjectInfo(info);
                }
                else {
                    setProjectInfo(null);
                }
            } catch (e) {
                console.error("Failed to parse project info", e);
            }
        }
    }, [list, isLoading]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!list) return <div>Project niet gevonden</div>;

    const name = list.name['nl-NL'] || list.name['en-GB'] || "Naamloos Project";

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
            <ProjectHeader name={name} id={id} />
            <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PRIMARY CONTENT COLUMN */}
                <div className="lg:col-span-8 space-y-8">
                    {activeTab === 'info' && (
                        <AddressBento id={id} projectInfo={projectInfo} />
                    )}
                    {(activeTab === 'info' || activeTab === 'collections') && (
                        <ItemCollections 
                            activeTab={activeTab} 
                            onViewAll={() => setActiveTab('collections')} 
                        />
                    )}
                    {activeTab === 'people' && (
                        <ProjectPeople id={id} variant="full" />
                    )}
                </div>
                {/* SIDEBAR COLUMN */}
                <aside className="lg:col-span-4 space-y-8">
                    <ProjectTimeline />
                    {activeTab === 'info' && (
                        <>
                            <ProjectPeople id={id} variant="snippet" />
                            <ProjectMap />
                        </>
                    )}
                </aside>
            </div>
        </main>
    );
}