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

export function generateRandomUID(digits: number): number {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
}

export const parsePassportFile = (fileContent: string) => {
    try {
        const jsonContent = JSON.parse(fileContent) as IMonadicDNAPassport;
        if (!isValidMonadicDNAPassport(jsonContent)) {
            throw new Error('Parsed JSON content does not match IMonadicDNAPassport interface');
        }
        return jsonContent;
    } catch (error) {
        console.error('Error parsing JSON file:', error);
        throw error;
    }
};

export const getRiskLevel = (value: string | number): string => {
    if (typeof value === 'string') {
        const lowerCaseValue = value.toLowerCase();
        if (lowerCaseValue === 'yes') return 'High Risk';
        if (lowerCaseValue === 'no') return 'Low Risk';
    } else if (typeof value === 'number') {
        if (value >= 0 && value <= 10) return 'Low Risk';
        if (value >= 11 && value <= 15) return 'Medium Risk';
        if (value >= 15) return 'High Risk';
    }
    return 'Unknown';
};


export const getValue = (data: string) => {
    try {
        const parsedData = JSON.parse(data);
        const score = parsedData.score;
        console.log('Score:', score);
        return score;
    } catch (error) {
        return data;
    }
}

export const isValidMonadicDNAPassport = (jsonContent: any): jsonContent is IMonadicDNAPassport => {
    const { passport_id, filename_hash, data_hash, nillion_data } = jsonContent;

    return (
        typeof passport_id === 'string' &&
        typeof filename_hash === 'string' &&
        typeof data_hash === 'string' &&
        typeof nillion_data === 'object' &&
        !Array.isArray(nillion_data) &&
        Object.keys(nillion_data).length !== 0 &&
        Object.values(nillion_data).every(value => typeof value === 'string')
    );
};