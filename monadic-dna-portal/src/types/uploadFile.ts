export type ActionType = 'createPassport' | 'viewResults';

export interface IActionData {
    type: ActionType;
    title: string;
    buttonTitle: string;
    buttonAction: string;
}

export const ActionData: Record<ActionType, IActionData> = {
    'createPassport': {
        title: 'Upload Raw DNA File',
        buttonTitle: 'Create DNA PAssport',
        buttonAction: 'createDNAPassport',
        type: 'createPassport'
    },
    'viewResults': {
        title: 'Upload Your DNA Passport',
        buttonTitle: 'View Results',
        buttonAction: 'viewResults',
        type: 'viewResults'
    }
}