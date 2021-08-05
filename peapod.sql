\echo 'Delete and recreate peapod db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE peapod;
CREATE DATABASE peapod;
\connect peapod

\i peapod-schema.sql
\i peapod-seed.sql

\echo 'Delete and recreate peapod_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE peapod_test;
CREATE DATABASE peapod_test;
\connect peapod_test

\i peapod-schema.sql
