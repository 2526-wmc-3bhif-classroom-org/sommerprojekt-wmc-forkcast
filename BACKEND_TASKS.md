# Backend Tasks — Account Page Features

These tasks are required to make the account page fully functional. The UI is already built with placeholder data.

---

## 1. Favorites Endpoints

**Routes:** `GET/POST/DELETE /api/users/me/favorites`  
**File:** `backend/src/routes/favoriteRoutes.ts` (stubs already exist, return 409)

### GET /api/users/me/favorites
- Auth: JWT required (already applied globally in `app.ts`)
- Returns: `Array<{ id: number, name: string, image: string | null }>`
- SQL: `SELECT r.id, r.name, r.image FROM FavoriteFood ff JOIN Recipe r ON ff.recipeId = r.id WHERE ff.userId = :userId`

### POST /api/users/me/favorites
- Auth: JWT required
- Body: `{ recipeId: number }`
- Returns: 201 Created
- SQL: `INSERT OR IGNORE INTO FavoriteFood (userId, recipeId) VALUES (:userId, :recipeId)`
- Note: Validate that the recipe exists before inserting.

### DELETE /api/users/me/favorites/:recipeId
- Auth: JWT required
- Returns: 204 No Content, or 404 if not found
- SQL: `DELETE FROM FavoriteFood WHERE userId = :userId AND recipeId = :recipeId`

**Repository methods to add in `UserRepository`:**
```typescript
getFavorites(userId: number): Pick<Recipe, "id" | "name" | "image">[]
addFavorite(userId: number, recipeId: number): void
removeFavorite(userId: number, recipeId: number): boolean
```

---

## 2. Friends Endpoints

**Routes:** `GET/DELETE /api/users/me/friends`  
**File:** `backend/src/routes/friendRoutes.ts` (stubs already exist, return 409)

### GET /api/users/me/friends
- Auth: JWT required
- Returns: `Array<{ id: number, name: string, profilePicture: string | null }>`
- SQL: `SELECT u.id, u.name, u.profilePicture FROM Friend f JOIN User u ON f.friendId = u.id WHERE f.userId = :userId`

### DELETE /api/users/me/friends/:friendId
- Auth: JWT required
- Returns: 204 No Content, or 404 if not found
- SQL: `DELETE FROM Friend WHERE userId = :userId AND friendId = :friendId`

**Repository methods to add in `UserRepository`:**
```typescript
getFriends(userId: number): Pick<User, "id" | "name" | "profilePicture">[]
removeFriend(userId: number, friendId: number): boolean
```

---

## 3. Profile Update Endpoints

**Routes:** new endpoints on `/api/users/me`  
**File:** `backend/src/routes/profileRoutes.ts`

### PATCH /api/users/me/name
- Auth: JWT required
- Body: `{ name: string }`
- Validation: non-empty, max 50 chars, unique (return 409 if taken)
- Returns: updated user DTO (without password)
- SQL: `UPDATE User SET name = :name WHERE id = :id RETURNING *`

### PATCH /api/users/me/password
- Auth: JWT required
- Body: `{ currentPassword: string, newPassword: string }`
- Validation: verify `currentPassword` matches stored bcrypt hash (`comparePassword` from `utils.ts`), `newPassword` min 8 chars
- Returns: 204 No Content on success, 400 if current password wrong
- SQL: `UPDATE User SET password = :passwordHash WHERE id = :id` (use `hashPassword` from `utils.ts`)

**Repository methods to add in `UserRepository`:**
```typescript
updateName(id: number, name: string): User
updatePassword(id: number, passwordHash: string): void
```

---

## Notes

- DB schema already has `FavoriteFood` and `Friend` tables (see `backend/src/db/unit.ts`)
- The `UserRepository` pattern is already established — follow the same Unit-of-work pattern as existing methods
- `hashPassword` and `comparePassword` are exported from `backend/src/utils.ts`
- All new routes follow the same error handling pattern as `profileRoutes.ts`
