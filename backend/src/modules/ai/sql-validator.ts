/**
 * SQL Query Validator - Ensures only safe SELECT queries
 */

export class SQLValidator {
  /**
   * Dangerous SQL keywords that are not allowed
   */
  private static readonly DANGEROUS_KEYWORDS = [
    'DELETE',
    'DROP',
    'UPDATE',
    'INSERT',
    'ALTER',
    'CREATE',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
    'EXEC',
    'EXECUTE',
  ];

  /**
   * Validate SQL query for safety
   * Only allows SELECT queries
   */
  static validateQuery(query: string): {
    valid: boolean;
    error?: string;
  } {
    if (!query || query.trim().length === 0) {
      return { valid: false, error: 'Query cannot be empty' };
    }

    const upperQuery = query.toUpperCase().trim();

    // Must start with SELECT
    if (!upperQuery.startsWith('SELECT')) {
      return {
        valid: false,
        error: 'Only SELECT queries are allowed',
      };
    }

    // Check for dangerous keywords
    for (const keyword of this.DANGEROUS_KEYWORDS) {
      if (
        this.containsKeyword(upperQuery, keyword) &&
        !this.isInStringLiteral(query, keyword)
      ) {
        return {
          valid: false,
          error: `Dangerous keyword "${keyword}" detected. Only SELECT queries are allowed.`,
        };
      }
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPattern(upperQuery)) {
      return {
        valid: false,
        error: 'Query contains suspicious patterns',
      };
    }

    return { valid: true };
  }

  /**
   * Check if keyword exists in query (case-insensitive)
   */
  private static containsKeyword(query: string, keyword: string): boolean {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(query);
  }

  /**
   * Check if keyword appears in string literal
   */
  private static isInStringLiteral(query: string, keyword: string): boolean {
    // Simple check - if keyword is between quotes, ignore it
    const singleQuoteRegex = /'[^']*'/g;
    const doubleQuoteRegex = /"[^"]*"/g;

    const singleQuoteMatches = query.match(singleQuoteRegex) || [];
    const doubleQuoteMatches = query.match(doubleQuoteRegex) || [];

    const allLiterals = [...singleQuoteMatches, ...doubleQuoteMatches];

    return allLiterals.some((literal) =>
      literal.toUpperCase().includes(keyword)
    );
  }

  /**
   * Check for suspicious SQL injection patterns
   */
  private static containsSuspiciousPattern(query: string): boolean {
    const suspiciousPatterns = [
      /;\s*(DELETE|DROP|UPDATE|INSERT|ALTER)/i,
      /\/\*[\s\S]*?\*\//,
      /--[\s\S]*/,
      /xp_/i,
      /sp_/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(query));
  }

  /**
   * Sanitize query - remove dangerous content
   */
  static sanitizeQuery(query: string): string {
    // Remove comments
    let sanitized = query.replace(/--[^\n]*/g, '');
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

    // Trim
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Extract SELECT columns from query
   */
  static extractColumns(query: string): string[] {
    const selectRegex = /SELECT\s+([\s\S]*?)\s+FROM/i;
    const match = query.match(selectRegex);

    if (!match) {
      return ['*'];
    }

    const columnsPart = match[1];
    const columns = columnsPart
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col.length > 0);

    return columns;
  }

  /**
   * Extract tables from query
   */
  static extractTables(query: string): string[] {
    // Simple extraction of table names after FROM and JOIN
    const fromRegex = /FROM\s+(\w+)/gi;
    const joinRegex = /JOIN\s+(\w+)/gi;

    const tables: string[] = [];
    let match;

    while ((match = fromRegex.exec(query)) !== null) {
      tables.push(match[1].toLowerCase());
    }

    while ((match = joinRegex.exec(query)) !== null) {
      tables.push(match[1].toLowerCase());
    }

    return [...new Set(tables)]; // Remove duplicates
  }

  /**
   * Add LIMIT to query if not present
   */
  static addQueryLimit(query: string, limit: number = 100): string {
    if (/LIMIT\s+\d+/i.test(query)) {
      return query;
    }
    return `${query} LIMIT ${limit}`;
  }
}
