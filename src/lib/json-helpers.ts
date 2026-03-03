/**
 * Safely parse JSON string to array
 * Returns empty array if parsing fails or value is invalid
 */
export function safeJsonParse<T = any>(value: any): T[] {
  if (!value) return [] as T[]
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    // Check if it's an empty string
    if (value === '' || value === '[]') return [] as T[]
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : [parsed as T]
    } catch {
      // If it's not valid JSON, treat it as a single string item
      return [value as unknown as T]
    }
  }
  return [] as T[]
}

/**
 * Safely stringify array to JSON
 * Returns '[]' for empty or invalid arrays
 */
export function safeStringify(value: any[] | undefined | null): string {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return '[]'
  }
  return JSON.stringify(value)
}

/**
 * Parse course data from database to frontend format
 */
export function parseCourseData(course: any) {
  return {
    ...course,
    requirements: safeJsonParse(course.requirements),
    objectives: safeJsonParse(course.objectives),
    tags: safeJsonParse(course.tags),
  }
}