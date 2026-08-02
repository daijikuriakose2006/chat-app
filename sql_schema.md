# Database Schema Explainer: Firebase Firestore mapped to SQL

This document explains the Firestore structure using SQL terminology to help visualize the data layout.

---

## 1. Users Entity (`users` Collection)

In a traditional SQL database, this is the `users` table.

```sql
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,      -- Firebase Auth UID
    display_name VARCHAR(100) NOT NULL, -- User display name
    email VARCHAR(255) UNIQUE NOT NULL, -- User email address
    photo_url TEXT,                     -- URL to user profile avatar
    status VARCHAR(20) DEFAULT 'offline', -- 'online' or 'offline'
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Firestore Representation
- **Collection Name**: `users`
- **Document ID**: `uid` (matching Firebase Authentication UID)
- **Document Fields**:
  - `uid`: `string`
  - `displayName`: `string`
  - `email`: `string`
  - `photoURL`: `string`
  - `status`: `string`
  - `lastSeen`: `timestamp`

---

## 2. Chat Rooms Entity (`rooms` Collection)

In a traditional SQL database, this is the `rooms` table.

```sql
CREATE TABLE rooms (
    id VARCHAR(255) PRIMARY KEY,        -- Firestore Auto-generated ID
    name VARCHAR(100) UNIQUE NOT NULL,  -- Room name (unique for searching/joining)
    visibility VARCHAR(10) NOT NULL,   -- 'public' or 'private'
    password VARCHAR(255),              -- Room password (nullable, only if private)
    created_by VARCHAR(255),            -- Foreign Key referencing users(uid)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(uid) ON DELETE SET NULL
);
```

### Firestore Representation
- **Collection Name**: `rooms`
- **Document ID**: Auto-generated string (e.g. `hE6KszuP90Lz...`)
- **Document Fields**:
  - `id`: `string` (equal to document ID)
  - `name`: `string`
  - `visibility`: `string` ("public" or "private")
  - `password`: `string` (plain or hashed room password)
  - `createdBy`: `string` (UID of the creator user)
  - `createdAt`: `timestamp`

---

## 3. Room Messages Entity (`rooms/{roomId}/messages` Subcollection)

In SQL, this is typically a separate table representing a many-to-one relation with `rooms` and `users`.

```sql
CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,        -- Firestore Auto-generated ID
    room_id VARCHAR(255) NOT NULL,      -- Foreign Key referencing rooms(id)
    sender_id VARCHAR(255) NOT NULL,    -- Foreign Key referencing users(uid)
    sender_name VARCHAR(100) NOT NULL,  -- Denormalized sender name (for real-time efficiency)
    sender_photo TEXT,                  -- Denormalized sender photo URL
    text TEXT NOT NULL,                 -- Message body (plain text chat only)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(uid) ON DELETE CASCADE
);
```

### Firestore Representation
- **Subcollection Location**: `rooms/{roomId}/messages`
- **Document ID**: Auto-generated string (e.g. `zKxL9P01Lz...`)
- **Document Fields**:
  - `id`: `string` (equal to document ID)
  - `text`: `string`
  - `senderId`: `string`
  - `senderName`: `string`
  - `senderPhoto`: `string`
  - `createdAt`: `timestamp`

---

## 4. Query Indexes & Execution Rules

To ensure real-time query efficiency in Firestore:
1. **Querying Rooms**:
   - Querying all rooms: Simple collection-wide listen.
   - Searching rooms by name: Prefix search or exact equality query. No composite index required.
2. **Querying Messages**:
   - Query messages for a room ordered by time: Ordered by `createdAt` ascending. This is handled inside the subcollection `messages` of a specific room, so no complex index is required unless you filter on multiple fields.
