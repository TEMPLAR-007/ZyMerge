export default {
    providers: [
        {
            domain: process.env.CONVEX_SITE_URL,
            applicationID: "convex",
        },
        // Google OAuth will be added after setting up credentials
        // {
        //   id: "google",
        //   type: "oauth",
        //   clientId: process.env.GOOGLE_CLIENT_ID,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // }
    ],
};