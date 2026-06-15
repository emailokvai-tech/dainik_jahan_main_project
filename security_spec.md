# Security Specification - Dainik Jahan News Portal

## Data Invariants
1. **Articles**: Must have a valid `source`, `title`, and `publishedAt`.
2. **System Writes Only**: Articles and SyncState can only be modified by administrative or system processes (simulated via strict rules in this environment, as we don't have a separate service account for the preview's backend sync).
3. **Public Read**: All published articles are publicly readable.

## The Dirty Dozen (Test Payloads)
1. **Malicious Delete**: Attempt to delete an article as an unauthenticated user. -> EXPECTED: PERMISSION_DENIED
2. **Unauthorized Write**: Attempt to create an article with a fake source. -> EXPECTED: PERMISSION_DENIED
3. **Ghost Field**: Attempt to add `isVerified: true` to an article. -> EXPECTED: PERMISSION_DENIED
4. **Identity Spoofing**: Attempt to update `publishedAt` on an existing article. -> EXPECTED: PERMISSION_DENIED
5. **PII Leak**: Attempt to reach a non-existent `users` collection. -> EXPECTED: PERMISSION_DENIED
6. **Large ID**: Inject a 1MB string as a document ID. -> EXPECTED: PERMISSION_DENIED
7. **Sync State Tamper**: Attempt to reset `lastSyncAt`. -> EXPECTED: PERMISSION_DENIED
8. **Invalid Enum**: Set article status to `deleted` (not in enum). -> EXPECTED: PERMISSION_DENIED
9. **Missing Required**: Create article without `content`. -> EXPECTED: PERMISSION_DENIED
10. **Type Mismatch**: Set `isBreaking` to "yes" (string instead of boolean). -> EXPECTED: PERMISSION_DENIED
11. **URL Poisoning**: Set `originalUrl` to a malicious script string. -> EXPECTED: PERMISSION_DENIED
12. **Spam Article**: create article with 10,000 characters in title. -> EXPECTED: PERMISSION_DENIED
