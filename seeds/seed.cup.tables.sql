BEGIN;

TRUNCATE
  "comments",
  "posts",
  "users";

INSERT INTO "users" ("id", "name", "user_name", "password", "email", "zip", "admin_status")
VALUES
  (1, 'admin1', 'admin1', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'admin@admin.com', 00999, 'true'), --password = pass
  (2, 'daniel', 'daniel', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'daniel@daniel.com', 00999, 'false'); --password = pass

-- INSERT INTO "posts"


INSERT INTO "posts" ("id", "user_id", "user_name", "user_user_name", "type", "title", "zip", "comments", "description") 
VALUES
  (1, 1, "admin1", "admin1", "request", "Somebody please get me some toilet paper", 00999, 3, "It has been so hard to get tp since the quarantine");
  -- (2, 1, "admin2", "admin2", "offer", "Homemade masks available", 00999, 2, "Together we can stop the spread!"),
  -- (3, 2, "daniel", "daniel", "request", "Anyone have flour?", 00999, 3, "Just need 3 cups of flour for the latest baking project please help"),
  -- (4, 2, "daniel", "daniel", "offer", "Grocery store runs on Tuesdays", 00999, 3, "To anyone not feeling safe during these times going to the grocery store, I'll be making runs on Tuesdays and will happily pick up some items for you.");

-- INSERT INTO "comments" ("id", "user_id", "user_name", "user_user_name", "post_id", "content")
-- VALUES 
--   (1, 1, "admin", "admin", 3, "I have some flour you can have no problem"),
--   (2, 2, "daniel", "daniel", 1, "I need all 2654 rolls I have but I will keep an eye out when I go to the store"),
--   (3, 1, "admin", "admin", 1, "Oh you're such a sweety thank you");

COMMIT;

