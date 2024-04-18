import { IMonadicDNAPassport } from "@/types";

export const formatFileSize = (size: number): string => {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const parsePassportFile = (fileContent: string) => {
    try {
        const jsonContent = JSON.parse(fileContent) as IMonadicDNAPassport;
        return jsonContent;
    } catch (error) {
        console.error('Error parsing JSON file:', error);
        throw error;
    }
};