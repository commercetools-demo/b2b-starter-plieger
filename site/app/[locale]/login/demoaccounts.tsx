"use client";

import { useState } from "react";
import { Company, BusinessUnit, Person } from "./org_data";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

const PASSWORD = 'Password123';

const PersonItem = ({ person, domain, onSelect }: { person: Person; domain: string; onSelect?: (email: string) => void }) => {
        const { login } = useAuth();
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const { addToast } = useToast();
   const { localePath } = useLocale();
   const router = useRouter();
   
   
  
   const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      addToast('Signed in successfully');
      router.push(localePath('/dashboard'));
    } catch (err: any) {
      setError(err?.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  const fillCredentials = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword(PASSWORD);
    doLogin(accountEmail, PASSWORD);
  };
    
    const emailaddress = `${person.firstName.toLowerCase()}.${person.lastName.toLowerCase().replace(/\s+/g, "")}@${domain}`;
    return (
        <div 
            className={`group relative ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={() => fillCredentials(emailaddress)}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    {person.firstName[0]}{person.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                        {person.firstName} {person.lastName}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                        {person.role}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono bg-slate-50 p-1 rounded border border-slate-100 group-hover:border-primary-light group-hover:bg-primary/5 transition-all">
                        <svg className="h-2.5 w-2.5 shrink-0 text-slate-300 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">
                            {email}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UnitSection = ({ unit, domain, onSelectAccount, depth = 0 }: { unit: BusinessUnit; domain: string; onSelectAccount?: (email: string) => void; depth?: number }) => (
    <div className={depth > 0 ? "mt-6 pt-5 border-t border-slate-100 ml-1 pl-4 border-l-2 border-slate-100" : ""}>
        <div className="flex items-center justify-between mb-3">
             <h4 className={depth === 0 ? "text-[10px] font-bold uppercase tracking-widest text-slate-400" : "text-sm font-bold text-slate-800"}>
                 {depth === 0 ? "Headquarters" : unit.name}
             </h4>
             <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                 {unit.people.length} users
             </span>
        </div>
        
        <div className="space-y-3">
            {unit.people.map((person, idx) => (
                <PersonItem key={idx} person={person} domain={domain} onSelect={onSelectAccount} />
            ))}
        </div>

        {unit.subUnits?.map((sub, idx) => (
            <UnitSection key={idx} unit={sub} domain={domain} onSelectAccount={onSelectAccount} depth={depth + 1} />
        ))}
    </div>
);



const CompanyCard = ({ company, onSelectAccount }: { company: Company; onSelectAccount?: (email: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover-lift h-fit">
            <div 
                className="bg-surface-dark p-5 cursor-pointer select-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">{company.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{company.address}</span>
                        </p>
                    </div>
                    <div className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {company.focus}
                    </div>
                    {!isOpen && (
                         <span className="text-[10px] font-medium text-slate-400 bg-white/50 px-2 py-0.5 rounded-full border border-slate-100">
                             {company.people.length + (company.subUnits?.reduce((acc, sub) => acc + sub.people.length, 0) || 0)} users
                         </span>
                    )}
                </div>
            </div>
            
            {/* Accordion Content with smooth height transition */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-5 border-t border-slate-100">
                        <UnitSection unit={company} domain={company.domain} onSelectAccount={onSelectAccount} />
                    </div>
                </div>
            </div>
        </div>
    );
};



export default function DemoAccounts({ companies, onSelectAccount }: { companies: Company[]; onSelectAccount?: (email: string) => void }) {
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 p-4 mb-20">
            {companies.map((company) => (
                <CompanyCard key={company.name} company={company} onSelectAccount={onSelectAccount} />
            ))}
        </div>
    );
}