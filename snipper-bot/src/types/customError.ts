export interface CustomError {
  type: string;
  message: string;
  description?: string;
}

export const ERROR_TYPES = {
  NILLION: 'NILLION_ERROR',
  SIGN_PROTOCOL: 'SIGN_PROTOCOL_ERROR',
  INVALID_FILE: 'INVALID_FILE_ERROR',
};

export const nillionError: CustomError = {
  type: ERROR_TYPES.NILLION,
  message: 'Nillion Error',
  description: 'An error occurred while trying to compute data on Nillion.',
};

export const createAttestationError: CustomError = {
  type: ERROR_TYPES.SIGN_PROTOCOL,
  message: 'Create Attestation Error',
  description: 'An error occurred while creating attestation.',
};

export const retreiveResultsError: CustomError = {
  type: ERROR_TYPES.SIGN_PROTOCOL,
  message: 'Query Attestation Error',
  description: 'An error occurred while retreiving results.',
};

export const invalidFileError: CustomError = {
  type: ERROR_TYPES.INVALID_FILE,
  message: 'Invalid File Format',
  description: 'Please ensure it is a Monadic DNA passport file in JSON format.',
};
