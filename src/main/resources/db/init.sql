CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE  NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    role          VARCHAR(20)         NOT NULL DEFAULT 'USER',
    created_at    TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fields
(
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name            VARCHAR(100)     NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    vegetation_type VARCHAR(20)      NOT NULL,
    size_hectares   DOUBLE PRECISION,
    elevation       DOUBLE PRECISION,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weather_readings
(
    id                 BIGSERIAL PRIMARY KEY,
    field_id           BIGINT NOT NULL REFERENCES fields (id) ON DELETE CASCADE,
    fetched_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature        DOUBLE PRECISION,
    humidity           INTEGER,
    wind_speed         DOUBLE PRECISION,
    wind_direction     INTEGER,
    pressure           DOUBLE PRECISION,
    precipitation      DOUBLE PRECISION,
    soil_moisture      DOUBLE PRECISION,
    fire_weather_index DOUBLE PRECISION
);

CREATE TABLE rain_predictions
(
    id               BIGSERIAL PRIMARY KEY,
    field_id         BIGINT           NOT NULL REFERENCES fields (id) ON DELETE CASCADE,
    predicted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    forecast_date    DATE             NOT NULL,
    rain_probability DOUBLE PRECISION NOT NULL,
    expected_mm      DOUBLE PRECISION,
    will_rain        BOOLEAN          NOT NULL
);

CREATE TABLE fire_risk_predictions
(
    id           BIGSERIAL PRIMARY KEY,
    field_id     BIGINT           NOT NULL REFERENCES fields (id) ON DELETE CASCADE,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_score   DOUBLE PRECISION NOT NULL,
    risk_level   VARCHAR(10)      NOT NULL,
    temperature  DOUBLE PRECISION,
    humidity     DOUBLE PRECISION,
    wind_speed   DOUBLE PRECISION,
    fwi          DOUBLE PRECISION
);

CREATE TABLE alerts
(
    id         BIGSERIAL PRIMARY KEY,
    field_id   BIGINT      NOT NULL REFERENCES fields (id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL,
    risk_level VARCHAR(10) NOT NULL,
    message    TEXT,
    is_read    BOOLEAN   DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_fields_user ON fields (user_id);
CREATE INDEX idx_weather_field ON weather_readings (field_id);
CREATE INDEX idx_rain_field_date ON rain_predictions (field_id, forecast_date);
CREATE INDEX idx_fire_field ON fire_risk_predictions (field_id);
CREATE INDEX idx_alerts_field ON alerts (field_id);