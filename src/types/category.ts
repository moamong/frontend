import type { RecordType } from "./record";

export type Category = {
  id: string;
  name: string;
  type: RecordType;
  icon: string;
  color: string;
  isDefault: boolean;
  isHidden?: boolean;
};
