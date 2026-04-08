export interface iProjectInfo {
    referenceCode?: string;
    description?: string;
    contactName?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    companyName?: string;
    projectManager?: string;
    startDate?: string;
    endDate?: string;
    // Flat address fields for forms
    address?: string;
    city?: string;
    zipCode?: string;
    constructionAddress?: {
        street?: string;
        city?: string;
        zip?: string;
    };
    clientAddress?: {
        street?: string;
        city?: string;
        zip?: string;
    };
    additionalAddresses?: Array<{
        id: string;
        label: string;
        street: string;
        city: string;
        zip: string;
    }>;
}
