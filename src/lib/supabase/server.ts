import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const allowedEmailsRaw = process.env.ADMIN_ALLOWED_EMAILS?.trim() ?? "";

  const isConfigured =
    Boolean(url && anonKey) &&
    url.startsWith("http") &&
    !url.includes("your-project-id");

  const allowedEmails = allowedEmailsRaw
    ? allowedEmailsRaw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return {
    url,
    anonKey,
    serviceRoleKey:
      serviceRoleKey && !serviceRoleKey.includes("your-supabase-service-role-key")
        ? serviceRoleKey
        : "",
    allowedEmails,
    isConfigured,
  };
}

/**
 * Server-side Supabase client using the public anon key (RLS enforced).
 */
export function createPublicServerClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Server-side Supabase client for administrative operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY if configured, or forwards the verified
 * administrator's Bearer access token so RLS policies for `authenticated` pass.
 */
export function createAdminServerClient(
  accessToken?: string,
): SupabaseClient | null {
  const { url, anonKey, serviceRoleKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;

  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export interface AdminAuthResult {
  authorized: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
  status: number;
}

/**
 * Verifies that an incoming request to an admin endpoint carries a valid
 * Supabase Auth JWT belonging to an authorized salon administrator.
 */
export async function verifyAdminRequest(
  request: Request,
): Promise<AdminAuthResult> {
  const { isConfigured, allowedEmails } = getSupabaseEnv();
  if (!isConfigured) {
    return {
      authorized: false,
      error:
        "Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      status: 503,
    };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return {
      authorized: false,
      error: "Authentication required. Please log in to the admin portal.",
      status: 401,
    };
  }

  const supabase = createPublicServerClient();
  if (!supabase) {
    return {
      authorized: false,
      error: "Database connection unavailable.",
      status: 503,
    };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return {
      authorized: false,
      error: "Invalid or expired administrator session. Please sign in again.",
      status: 401,
    };
  }

  const userEmail = (data.user.email ?? "").toLowerCase();
  const hasAppMetadataAdminRole =
    data.user.app_metadata?.role === "admin" ||
    data.user.app_metadata?.is_admin === true;

  if (allowedEmails.length > 0) {
    if (!userEmail || !allowedEmails.includes(userEmail)) {
      return {
        authorized: false,
        error: "This account is not authorized to manage Shore Nails reviews.",
        status: 403,
      };
    }
  } else if (!hasAppMetadataAdminRole) {
    return {
      authorized: false,
      error:
        "This account does not have administrator privileges. Set ADMIN_ALLOWED_EMAILS on the server or assign app_metadata.role = 'admin' in Supabase.",
      status: 403,
    };
  }

  return {
    authorized: true,
    user: data.user,
    accessToken: token,
    status: 200,
  };
}

/**
 * In-memory rate limiting & duplicate submission protection for review POSTs.
 */
interface RateBucket {
  timestamps: number[];
  recentSignatures: Map<string, number>;
}

const rateBuckets = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const DUPLICATE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export function checkSubmissionRateLimit(
  clientIp: string,
  signature: string,
): { allowed: boolean; error?: string } {
  const now = Date.now();
  const bucket = rateBuckets.get(clientIp) ?? {
    timestamps: [],
    recentSignatures: new Map<string, number>(),
  };

  // Prune expired timestamps
  bucket.timestamps = bucket.timestamps.filter(
    (ts) => now - ts < RATE_WINDOW_MS,
  );
  for (const [sig, ts] of bucket.recentSignatures.entries()) {
    if (now - ts >= DUPLICATE_COOLDOWN_MS) {
      bucket.recentSignatures.delete(sig);
    }
  }

  if (bucket.recentSignatures.has(signature)) {
    return {
      allowed: false,
      error:
        "This review has already been submitted recently. Thank you for your feedback!",
    };
  }

  if (bucket.timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return {
      allowed: false,
      error:
        "Too many review submissions from this connection. Please wait a few minutes and try again.",
    };
  }

  bucket.timestamps.push(now);
  bucket.recentSignatures.set(signature, now);
  rateBuckets.set(clientIp, bucket);

  return { allowed: true };
}

