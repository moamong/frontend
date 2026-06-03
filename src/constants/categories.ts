import type { Category } from "../types/category";

export const defaultExpenseCategories: Category[] = [
  { id: "expense-food", name: "식비", type: "expense", icon: "bowl", color: "#ef8a62", isDefault: true },
  { id: "expense-cafe", name: "카페/간식", type: "expense", icon: "coffee", color: "#f0b27a", isDefault: true },
  { id: "expense-transport", name: "교통", type: "expense", icon: "bus", color: "#8dc9b5", isDefault: true },
  { id: "expense-shopping", name: "쇼핑", type: "expense", icon: "bag", color: "#f39c9c", isDefault: true },
  { id: "expense-home", name: "주거/관리비", type: "expense", icon: "home", color: "#c8a97e", isDefault: true },
  { id: "expense-phone", name: "통신비", type: "expense", icon: "phone", color: "#7ea8be", isDefault: true },
  { id: "expense-subscription", name: "구독", type: "expense", icon: "play", color: "#9b8ad1", isDefault: true },
  { id: "expense-health", name: "병원/약", type: "expense", icon: "medical", color: "#dc7f7f", isDefault: true },
  { id: "expense-culture", name: "문화/여가", type: "expense", icon: "ticket", color: "#6fb1a0", isDefault: true },
  { id: "expense-other", name: "기타", type: "expense", icon: "dots", color: "#b0a79f", isDefault: true },
];

export const defaultIncomeCategories: Category[] = [
  { id: "income-salary", name: "월급", type: "income", icon: "wallet", color: "#ef8a62", isDefault: true },
  { id: "income-side", name: "부업", type: "income", icon: "sparkles", color: "#8dc9b5", isDefault: true },
  { id: "income-allowance", name: "용돈", type: "income", icon: "gift", color: "#f0b27a", isDefault: true },
  { id: "income-interest", name: "이자", type: "income", icon: "coin", color: "#7ea8be", isDefault: true },
  { id: "income-refund", name: "환급", type: "income", icon: "return", color: "#c497d8", isDefault: true },
  { id: "income-other", name: "기타", type: "income", icon: "dots", color: "#b0a79f", isDefault: true },
];
