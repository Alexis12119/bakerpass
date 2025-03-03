export interface Visitor {
  id: number;
  name: string;
  purpose: string;
  contact: string;
  timeIn: string;
  timeOut: string | null;
}
