export const PROJECT_EXPENSE_CATEGORIES=["statik","mekanik","elektrik","zemin_etud","yapi_denetim","ozalit","belediye","harc","noter","ulasim","other"] as const;
export type ProjectExpenseCategory=typeof PROJECT_EXPENSE_CATEGORIES[number];
