export type ActionType = 'createPassport' | 'viewAttestation';

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
  'viewAttestation': {
    title: 'Upload Your DNA Passport',
    buttonTitle: 'View Attestation',
    buttonAction: 'viewAttestation',
    type: 'viewAttestation'
  }
}