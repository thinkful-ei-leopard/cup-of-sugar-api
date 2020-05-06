BEGIN;

TRUNCATE
  "messages",
  "threads",
  "comments",
  "posts",
  "users";

INSERT INTO "users" ("id", "name", "user_name", "password", "email", "zip", "admin_status", "img_src", "img_alt")
VALUES
  (1, 'admin1', 'admin1', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'admin@admin.com', 00999, 'true', null, 'Admin1 Profile Picture'), --password = pass
  (2, 'daniel1', 'daniel', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'daniel@daniel.com', 00999, 'false', null, 'daniel Profile Picture'); --password = pass


INSERT INTO "posts" ("id", "user_id", "type", "title", "description", "comments") 
VALUES
  (1, 1, 'request', 'Somebody please get me some toilet paper', 'It has been so hard to get tp since the quarantine', 2),
  (2, 1, 'offer', 'Homemade masks available', 'Together we can stop the spread!', 0),
  (3, 2, 'request', 'Anyone have flour?', 'Just need 3 cups of flour for the latest baking project please help', 1),
  (4, 2, 'offer', 'Grocery store runs on Tuesdays', 'To anyone not feeling safe during these times going to the grocery store, I will be making runs on Tuesdays and will happily pick up some items for you.', 0);

INSERT INTO "comments" ("id", "user_id", "post_id", "content")
VALUES 
  (1, 1, 3, 'I have some flour you can have no problem'),
  (2, 2, 1, 'I need all 2654 rolls I have but I will keep an eye out when I go to the store'),
  (3, 1, 1, 'Oh you are such a sweety thank you');

INSERT INTO "threads" ("id", "user_id1", "user_id2", "name1", "user_name1", "name2", "user_name2")
VALUES
  (1, 1, 2, 'admin1', 'admin1', 'daniel1', 'daniel');

INSERT INTO "messages" ("id", "user_id", "thread_id", "content")
VALUES
  (1, 1, 1, 'Hello'),
  (2, 2, 1, 'Hi'),
  (3, 1, 1, 'What is up my dude');
  
COMMIT;

