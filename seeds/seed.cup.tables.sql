BEGIN;

TRUNCATE
  "comments",
  "posts",
  "users";

INSERT INTO "users" ("id", "name", "user_name", "password", "email", "zip", "admin_status")
VALUES
  (1, 'admin1', 'admin1', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'admin@admin.com', 00999, 'true'), --password = pass
  (2, 'daniel1', 'daniel', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'daniel@daniel.com', 00999, 'false'); --password = pass


INSERT INTO "posts" ("id", "user_id", "type", "title", "description") 
VALUES
  (1, 1, 'request', 'Somebody please get me some toilet paper', 'It has been so hard to get tp since the quarantine'),
  (2, 1, 'offer', 'Homemade masks available', 'Together we can stop the spread!'),
  (3, 2, 'request', 'Anyone have flour?', 'Just need 3 cups of flour for the latest baking project please help'),
  (4, 2, 'offer', 'Grocery store runs on Tuesdays', 'To anyone not feeling safe during these times going to the grocery store, I will be making runs on Tuesdays and will happily pick up some items for you.');

INSERT INTO "comments" ("id", "user_id", "post_id", "content")
VALUES 
  (1, 1, 3, 'I have some flour you can have no problem'),
  (2, 2, 1, 'I need all 2654 rolls I have but I will keep an eye out when I go to the store'),
  (3, 1, 1, 'Oh you''re such a sweety thank you');

COMMIT;

