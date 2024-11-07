export interface ICustomer {
    _id?: string;
    name: string;
    phone: string;
    addresses: Address[];
  }
  
  export interface Address {
    type: string; // Home or Work, for example
    address: string;
    city: string;
    state: string;
  }
  