CREATE TABLE comments (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_user_name TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    date_modified TIMESTAMPTZ DEFAULT now() NOT NULL,
    content TEXT NOT NULL
);

