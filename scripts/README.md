# Development Scripts

This directory contains utility scripts for development and testing.

## test-real-auth.ts

A comprehensive integration test script that validates the authentication flow with real Sunsama credentials.

### Usage

1. Create a `.env` file in the project root with your Sunsama credentials:
   ```
   SUNSAMA_EMAIL=your-email@example.com
   SUNSAMA_PASSWORD=your-password
   ```

2. Run the test:
   ```bash
   npm run test:auth
   ```

### What it tests

- ✅ Client initialization
- ✅ Initial authentication state (should be false)
- ✅ Login with email and password
- ✅ Session cookie capture and storage
- ✅ Post-login authentication state (should be true)
- ✅ Authenticated GraphQL API call (`getUser`)
- ✅ Logout functionality
- ✅ Post-logout authentication state (should be false)

### Sample Output

```
🧪 Testing Sunsama Authentication with Real Credentials

📝 Creating Sunsama client...
🔍 Checking initial authentication state...
   Initially authenticated: false

🔐 Attempting login...
   Email: your-email@example.com
   Password: ************
✅ Login successful!

🔍 Checking authentication state after login...
   Now authenticated: true

👤 Testing getUser method...
✅ getUser successful!

📊 User Information:
   ID: 66367c3f3371330001081260
   Username: your.username
   Name: Your Name
   Email: your-email@example.com
   Timezone: America/New_York
   Created: 2024-05-04T18:19:43.448Z
   Days Planned: 226
   Admin: false

🚪 Testing logout...
   Authenticated after logout: false

🎉 All tests passed!
```

### Security Note

This script requires real Sunsama credentials. Make sure:
- Your `.env` file is in `.gitignore` (it is by default)
- Never commit real credentials to the repository
- Use this script only for local development and testing