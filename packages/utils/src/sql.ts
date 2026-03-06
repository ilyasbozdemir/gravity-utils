import { format } from 'sql-formatter'

export function formatSQL(sql: string, dialect: 'sql' | 'mysql' | 'postgresql' = 'sql'): string {
  return format(sql, { language: dialect, tabWidth: 2, keywordCase: 'upper' })
}
