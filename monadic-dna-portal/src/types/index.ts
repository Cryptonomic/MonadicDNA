export interface IMonadicDNAValidDataset {
  passportId: string;
  fileHash: string;
  dataHash: string;
  valid: boolean;
}

export interface IMonadicDNAPassport {
  passport_id: string;
  filename_hash: string;
  data_hash: string;
  nillion_data:  { [key: string]: string };
}

export interface IMonadicDNAVerifiedTrait {
  'Passport ID': string;
  'Provider': string;
  'Trait': string,
  'Value': string,
}