---
"sunsama-api": patch
---

Fix createTask GraphQL mutation by removing __typename from snooze input field

The createTask function was incorrectly including a __typename field in the TaskSnooze object when creating tasks with snooze configuration. GraphQL input types don't accept __typename fields, causing mutations to fail. This fix introduces a separate TaskSnoozeInput type without __typename and updates the createTask implementation to use it.