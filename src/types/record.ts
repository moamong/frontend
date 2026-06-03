export type RecordType = "income" | "expense";

export type MoneyRecord = {
  id: string;
  type: RecordType;
  amount: number;
  categoryId: string;
  memo?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
};
