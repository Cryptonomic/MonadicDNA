export type ActionType = 'createPassport' | 'viewResults';

export interface IActionData {
    type: ActionType;
    title: string;
    buttonTitle: string;
    buttonAction: string;
    acceptedFileFormats: string;
}

export const ActionData: Record<ActionType, IActionData> = {
    'createPassport': {
        title: 'Upload Raw DNA File',
        buttonTitle: 'Create DNA PAssport',
        buttonAction: 'createDNAPassport',
        type: 'createPassport',
        acceptedFileFormats: '.txt'
    },
    'viewResults': {
        title: 'Upload Your DNA Passport',
        buttonTitle: 'View Results',
        buttonAction: 'viewResults',
        type: 'viewResults',
        acceptedFileFormats: '.json'
    }
}

export interface IError {
    isError: boolean;
    title: string;
    text?: string;
}