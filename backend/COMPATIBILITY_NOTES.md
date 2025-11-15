# Backend-Frontend Compatibility Notes

## API Endpoint Differences

### Quiz Endpoints
- Frontend expects: `GET /api/quizzes`
- Backend provides: `GET /api/quiz/pools` (alias added at `/api/quizzes`)

## Field Name Differences

### QuizSession
- **Frontend expects**: `session_id` (string)
- **Backend returns**: `id` (number)
- **Solution**: Frontend should use `id` field, or backend serializer needs customization

### Activity
- **Frontend expects**: `event` (string)
- **Backend returns**: `event_type` (string)
- **Solution**: Add `event` property to serializer or update frontend types

### CreateQuizSession Request
- **Frontend sends**: `pool_id`, `num_questions`
- **Backend uses**: Only `pool_id` (num_questions is ignored)
- **Note**: Backend returns all questions in the pool

## Type Mismatches

### User/LeaderboardEntry IDs
- **Frontend types**: Use `string` for IDs
- **Backend models**: Use auto-increment integers
- **Solution**: Frontend should accept both string and number, or convert on client side

## Missing Implementations

### Code Execution (Quiz)
- Coding challenge test case execution is TODO in `quiz/views.py:submit_answer`
- Currently just checks if code is not empty

### Git Diff Generation (Agent)
- Diff generation is TODO in `agent/views.py:process_agent_job`
- Currently returns empty string

## Recommendations

1. **Update Frontend Types**: Change ID types from `string` to `number` for consistency
2. **Implement Code Runner**: Add safe code execution environment for coding challenges
3. **Add Serializer Field Aliases**: Use `source` parameter in serializers to match frontend expectations
4. **Document API Contracts**: Create OpenAPI/Swagger documentation

## Fixed Issues

✅ Added migrations directories for all apps
✅ Added `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
✅ Created custom email authentication backend
✅ Added missing activity event types (quiz_started, code_analyzed, reward_redeemed)
✅ Added URL alias for `/api/quizzes` endpoint
