interface ProjectTabsProps {
    activeTab: 'info' | 'collections' | 'people';
    onTabChange: (tab: 'info' | 'collections' | 'people') => void;
}

export default function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    return (
        <div className="flex gap-8 border-b border-surface-container-high mb-8">
            <button 
                onClick={() => onTabChange('info')}
                className={`pb-4 text-sm transition-all border-b-2 ${activeTab === 'info' ? 'font-bold border-primary text-primary' : 'font-semibold border-transparent text-on-surface-variant hover:text-primary'}`}
            >Projectinformatie</button>
            <button 
                onClick={() => onTabChange('collections')}
                className={`pb-4 text-sm transition-all border-b-2 ${activeTab === 'collections' ? 'font-bold border-primary text-primary' : 'font-semibold border-transparent text-on-surface-variant hover:text-primary'}`}
            >Itemcollecties</button>
            <button 
                onClick={() => onTabChange('people')}
                className={`pb-4 text-sm transition-all border-b-2 ${activeTab === 'people' ? 'font-bold border-primary text-primary' : 'font-semibold border-transparent text-on-surface-variant hover:text-primary'}`}
            >Mensen</button>
        </div>
    )
}
