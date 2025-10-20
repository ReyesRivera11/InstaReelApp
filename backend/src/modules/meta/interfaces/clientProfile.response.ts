export interface ClientProfileResponse {
  data:   Datum[];
  paging: Paging;
}

export interface Datum {
  id:                         string;
  name:                       string;
  instagram_business_account: InstagramBusinessAccount;
}

export interface InstagramBusinessAccount {
  id: string;
}

export interface Paging {
  cursors: Cursors;
}

export interface Cursors {
  before: string;
  after:  string;
}

