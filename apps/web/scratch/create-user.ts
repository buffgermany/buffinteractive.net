import { auth } from "../src/lib/auth";

async function main() {
    try {
        const user = await auth.api.signUpEmail({
            body: {
                email: "admin@platform.com",
                password: "PlatformAdmin2024!",
                name: "Platform Admin",
            }
        });
        console.log("User successfully created:", user.user.email);
    } catch (error: any) {
        console.error("Failed to create user:", error.message || error);
    }
}

main();
