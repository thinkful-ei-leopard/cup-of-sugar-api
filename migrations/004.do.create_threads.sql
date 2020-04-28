CREATE TABLE threads (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id1 INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_id2 INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name1 TEXT REFERENCES users(name) ON DELETE CASCADE NOT NULL,
    user_name1 TEXT REFERENCES users(user_name) ON DELETE CASCADE NOT NULL,
    name2 TEXT REFERENCES users(name) ON DELETE CASCADE NOT NULL,
    user_name2 TEXT REFERENCES users(user_name) ON DELETE CASCADE NOT NULL,
    date_modified TIMESTAMPTZ DEFAULT now() NOT NULL
);