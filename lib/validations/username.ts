import { z } from "zod";

/**
 * Username validation regex
 * - Alphanumeric characters and underscores only
 * - 3-20 characters in length
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Reserved usernames that cannot be used by regular users
 * Includes system routes, admin paths, and common reserved words
 */
export const RESERVED_USERNAMES = new Set([
  // System routes
  "api",
  "auth",
  "login",
  "signup",
  "register",
  "logout",
  "dashboard",
  "settings",
  "profile",
  "onboarding",
  "admin",
  "user",
  "users",

  // Reserved words
  "help",
  "support",
  "contact",
  "about",
  "terms",
  "privacy",
  "faq",
  "blog",
  "docs",
  "documentation",

  // Common protected words
  "root",
  "system",
  "administrator",
  "moderator",
  "mod",
  "staff",
  "team",
  "official",

  // Brand protection
  "ngl",
  "nglfs",
  "anonymous",

  // Potentially offensive (basic filter)
  "admin",
  "null",
  "undefined",
  "test",
  "demo",
]);

/**
 * Zod schema for username validation
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores")
  .refine(
    (username) => !RESERVED_USERNAMES.has(username.toLowerCase()),
    "This username is reserved and cannot be used"
  );

/**
 * Validate username format (client-side validation)
 * @param username - Username to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    usernameSchema.parse(username);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "Invalid username",
      };
    }
    return {
      isValid: false,
      error: "Invalid username",
    };
  }
}

/**
 * Check if username is reserved
 * @param username - Username to check
 * @returns True if username is reserved
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

/**
 * Generate username suggestions based on a taken username
 * @param baseUsername - The username that was taken
 * @returns Array of suggested usernames
 */
export function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseUsername.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 15);

  // Add number suffixes
  for (let i = 1; i <= 3; i++) {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    suggestions.push(`${cleanBase}${randomNum}`);
  }

  // Add underscore variations
  suggestions.push(`${cleanBase}_`);
  suggestions.push(`_${cleanBase}`);

  // Add year suffix
  const currentYear = new Date().getFullYear();
  suggestions.push(`${cleanBase}${currentYear}`);

  // Filter out any that might be too long or invalid
  return suggestions
    .filter((username) => {
      const validation = validateUsername(username);
      return validation.isValid;
    })
    .slice(0, 3); // Return max 3 suggestions
}

/**
 * Sanitize username input (remove special characters, trim, lowercase)
 * @param input - Raw username input
 * @returns Sanitized username
 */
export function sanitizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}
