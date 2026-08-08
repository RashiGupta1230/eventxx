/** @type {import("convex/server").AuthConfig} */

const clerkDomain =
    process.env.CLERK_JWT_ISSUER_DOMAIN ||
    process.env.NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN ||
    process.env.NEXT_PUBLIC_CLERK_ISSUER ||
    null;

if (!clerkDomain) {
    console.warn(
        "Convex auth: CLERK_JWT_ISSUER_DOMAIN is not set. Auth providers will not be configured."
    );
}

const authConfig = {
    providers: clerkDomain
        ? [
            {
                // Clerk issuer domain (e.g. https://<your-clerk-issuer>.clerk.dev)
                domain: clerkDomain,
                applicationID: "convex",
            },
        ]
        : [],
};

export default authConfig;