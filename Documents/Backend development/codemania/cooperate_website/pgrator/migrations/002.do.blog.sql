BEGIN;

CREATE OR REPLACE FUNCTION record_blog_updated_at() RETURNS TRIGGER AS
$$
BEGIN
    IF pg_trigger_depth() <> 1 THEN
        RETURN new;
    END IF;
    UPDATE blog u SET updated_at = current_timestamp WHERE u.id = new.id;
    RETURN new;
END;
$$ LANGUAGE PLPGSQL;


CREATE TABLE IF NOT EXISTS blog
(
    id                    VARCHAR(26) PRIMARY KEY,
    user_id                VARCHAR(26) NOT NULL,
    title                   TEXT,
    content                 TEXT,
    image                   TEXT,
    category                TEXT,  -- strategy| design | engineering | data process | innovation
    created_at            TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT current_timestamp
);

CREATE OR REPLACE TRIGGER record_blog_update_date
    AFTER UPDATE
    ON blog
    FOR EACH ROW
EXECUTE PROCEDURE record_user_updated_at();


COMMIT;

