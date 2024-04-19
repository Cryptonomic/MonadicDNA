
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

export interface ISNPs {
  id: string;
  trait: string;
}

export interface IComputedResult {
  trait: string;
  value: string;
}

export interface IViewAttestation {
  id: string;
  data: IMonadicDNAVerifiedTrait;
}

export interface IResultData {
  title: string;
  description: string;
  color: any;
  getFooterText(result: string): string;
}