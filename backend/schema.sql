-- EVENTLY PREMIUM SCHEMA & SEED DATA

-- Drop tables if they exist (to reset)
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS booking_coupon;
DROP TABLE IF EXISTS coupon;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS seat;
DROP TABLE IF EXISTS showtime;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS venue;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS organizer;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ORGANIZER
CREATE TABLE organizer (
    organizer_id SERIAL PRIMARY KEY,
    organization_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
);

-- CATEGORY
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- VENUE
CREATE TABLE venue (
    venue_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    capacity INT
);

-- EVENT
CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    organizer_id INT REFERENCES organizer(organizer_id) ON DELETE CASCADE,
    category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    language TEXT,
    duration_minutes INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SHOWTIME
CREATE TABLE showtime (
    showtime_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES event(event_id) ON DELETE CASCADE,
    venue_id INT REFERENCES venue(venue_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- SEATS
CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    venue_id INT REFERENCES venue(venue_id) ON DELETE CASCADE,
    row_label TEXT NOT NULL,
    seat_number INT NOT NULL,
    seat_type TEXT -- VIP, Regular, etc.
);

-- BOOKING
CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    showtime_id INT REFERENCES showtime(showtime_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- confirmed, cancelled, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TICKET
CREATE TABLE ticket (
    ticket_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    seat_id INT REFERENCES seat(seat_id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL
);

-- PAYMENT
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- success, failed, etc.
    transaction_ref TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATION
CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT, -- booking, system, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REVIEW
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT REFERENCES event(event_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COUPON
CREATE TABLE coupon (
    coupon_id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- percentage, fixed
    discount_value DECIMAL(10, 2) NOT NULL,
    min_amount DECIMAL(10, 2) DEFAULT 0
);

-- BOOKING_COUPON
CREATE TABLE booking_coupon (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    coupon_id INT REFERENCES coupon(coupon_id) ON DELETE CASCADE,
    UNIQUE (booking_id, coupon_id)
);

-- AUDIT LOG
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
-- USERS
INSERT INTO users (user_id, name, email, phone, password_hash) VALUES
(1, 'Bhuvan', 'bhuvan@gmail.com', '9999999991', '123'),
(2, 'Rahul', 'rahul@gmail.com', '9999999992', '123'),
(3, 'Ananya', 'ananya@gmail.com', '9999999993', '123'),
(4, 'Kiran', 'kiran@gmail.com', '9999999994', '123'),
(5, 'Sneha', 'sneha@gmail.com', '9999999995', '123')
ON CONFLICT (user_id) DO NOTHING;

-- ORGANIZER
INSERT INTO organizer (organizer_id, organization_name, contact_name, email, phone) VALUES
(1, 'Tech Corp', 'Arjun', 'tech@corp.com', '8888888881'),
(2, 'Music Fest Ltd', 'Riya', 'music@fest.com', '8888888882')
ON CONFLICT (organizer_id) DO NOTHING;

-- CATEGORY
INSERT INTO category (category_id, name, description) VALUES
(1, 'Tech', 'Technology Events'),
(2, 'Music', 'Music Shows'),
(3, 'Art', 'Art Exhibitions')
ON CONFLICT (category_id) DO NOTHING;

-- VENUE
INSERT INTO venue (venue_id, name, address, city, capacity) VALUES
(1, 'Convention Center', 'Main Road', 'Chennai', 200),
(2, 'Open Arena', 'Beach Side', 'Chennai', 500)
ON CONFLICT (venue_id) DO NOTHING;

-- EVENT
INSERT INTO event (event_id, organizer_id, category_id, title, description, image_url, price, language, duration_minutes) VALUES
(1, 1, 1, 'AI Conference', 'Explore the future of Artificial Intelligence and Machine Learning with industry leaders.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1170&auto=format&fit=crop', 599.00, 'English', 120),
(2, 2, 2, 'Live Concert', 'Experience an unforgettable night of live music featuring top artists and bands.', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1074&auto=format&fit=crop', 799.00, 'English', 180),
(3, 1, 3, 'Art Expo', 'Discover modern art masterpieces and meet the artists behind the canvas.', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1160&auto=format&fit=crop', 299.00, 'English', 90),
(4, 2, 2, 'DJ Night', 'Dance the night away with the hottest DJ tracks and high-energy vibes.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop', 499.00, 'English', 150),
(5, 1, 1, 'Hackathon', 'A 24-hour coding challenge to build innovative solutions and win prizes.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1170&auto=format&fit=crop', 650.00, 'English', 1440)
ON CONFLICT (event_id) DO NOTHING;

-- SHOWTIME
INSERT INTO showtime (showtime_id, event_id, venue_id, start_time, end_time) VALUES
(1, 1, 1, NOW(), NOW() + interval '2 hours'),
(2, 2, 2, NOW(), NOW() + interval '3 hours'),
(3, 3, 1, NOW(), NOW() + interval '1.5 hours'),
(4, 4, 2, NOW(), NOW() + interval '2.5 hours'),
(5, 5, 1, NOW(), NOW() + interval '4 hours')
ON CONFLICT (showtime_id) DO NOTHING;

-- SEATS
INSERT INTO seat (seat_id, venue_id, row_label, seat_number, seat_type) VALUES
(1,1,'A',1,'VIP'),
(2,1,'A',2,'VIP'),
(3,1,'A',3,'Regular'),
(4,1,'B',1,'Regular'),
(5,1,'B',2,'Regular'),
(6,2,'A',1,'VIP'),
(7,2,'A',2,'VIP'),
(8,2,'B',1,'Regular'),
(9,2,'B',2,'Regular'),
(10,2,'C',1,'Regular')
ON CONFLICT (seat_id) DO NOTHING;

-- BOOKING
INSERT INTO booking (booking_id, user_id, showtime_id, total_amount, status) VALUES
(1,1,1,500,'confirmed'),
(2,2,2,700,'confirmed'),
(3,3,3,300,'confirmed'),
(4,4,4,600,'confirmed'),
(5,5,5,800,'confirmed')
ON CONFLICT (booking_id) DO NOTHING;

-- TICKET
INSERT INTO ticket (ticket_id, booking_id, seat_id, price) VALUES
(1,1,1,500),
(2,2,6,700),
(3,3,3,300),
(4,4,8,600),
(5,5,10,800)
ON CONFLICT (ticket_id) DO NOTHING;

-- PAYMENT
INSERT INTO payment (payment_id, booking_id, amount, status, transaction_ref) VALUES
(1,1,500,'success','TXN001'),
(2,2,700,'success','TXN002'),
(3,3,300,'success','TXN003'),
(4,4,600,'success','TXN004'),
(5,5,800,'success','TXN005')
ON CONFLICT (payment_id) DO NOTHING;

-- NOTIFICATION
INSERT INTO notification (notification_id, user_id, message, type) VALUES
(1,1,'Booking Confirmed','booking'),
(2,2,'Booking Confirmed','booking'),
(3,3,'Booking Confirmed','booking'),
(4,4,'Booking Confirmed','booking'),
(5,5,'Booking Confirmed','booking')
ON CONFLICT (notification_id) DO NOTHING;

-- REVIEW
INSERT INTO review (review_id, user_id, event_id, rating, review_text) VALUES
(1,1,1,5,'Amazing AI event!'),
(2,2,2,4,'Great music!'),
(3,3,3,5,'Loved the art'),
(4,4,4,4,'Fun night'),
(5,5,5,5,'Best hackathon!')
ON CONFLICT (review_id) DO NOTHING;

-- COUPON
INSERT INTO coupon (coupon_id, code, discount_type, discount_value, min_amount) VALUES
(1,'DISC10','percentage',10,200)
ON CONFLICT (coupon_id) DO NOTHING;

-- BOOKING_COUPON
INSERT INTO booking_coupon (booking_id, coupon_id) VALUES
(1,1),
(2,1)
ON CONFLICT (booking_id, coupon_id) DO NOTHING;

-- AUDIT LOG
INSERT INTO audit_log (log_id, user_id, action, resource) VALUES
(1,1,'BOOK_EVENT','event 1'),
(2,2,'BOOK_EVENT','event 2'),
(3,3,'BOOK_EVENT','event 3'),
(4,4,'BOOK_EVENT','event 4'),
(5,5,'BOOK_EVENT','event 5')
ON CONFLICT (log_id) DO NOTHING;

-- RESET SEQUENCES (For Auto-Increment Consistency)
-- This ensures that the next auto-generated ID starts after the highest manually inserted ID.
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE(MAX(user_id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('organizer', 'organizer_id'), COALESCE(MAX(organizer_id), 1)) FROM organizer;
SELECT setval(pg_get_serial_sequence('category', 'category_id'), COALESCE(MAX(category_id), 1)) FROM category;
SELECT setval(pg_get_serial_sequence('venue', 'venue_id'), COALESCE(MAX(venue_id), 1)) FROM venue;
SELECT setval(pg_get_serial_sequence('event', 'event_id'), COALESCE(MAX(event_id), 1)) FROM event;
SELECT setval(pg_get_serial_sequence('showtime', 'showtime_id'), COALESCE(MAX(showtime_id), 1)) FROM showtime;
SELECT setval(pg_get_serial_sequence('seat', 'seat_id'), COALESCE(MAX(seat_id), 1)) FROM seat;
SELECT setval(pg_get_serial_sequence('booking', 'booking_id'), COALESCE(MAX(booking_id), 1)) FROM booking;
SELECT setval(pg_get_serial_sequence('ticket', 'ticket_id'), COALESCE(MAX(ticket_id), 1)) FROM ticket;
SELECT setval(pg_get_serial_sequence('payment', 'payment_id'), COALESCE(MAX(payment_id), 1)) FROM payment;
SELECT setval(pg_get_serial_sequence('notification', 'notification_id'), COALESCE(MAX(notification_id), 1)) FROM notification;
SELECT setval(pg_get_serial_sequence('review', 'review_id'), COALESCE(MAX(review_id), 1)) FROM review;
SELECT setval(pg_get_serial_sequence('coupon', 'coupon_id'), COALESCE(MAX(coupon_id), 1)) FROM coupon;
SELECT setval(pg_get_serial_sequence('audit_log', 'log_id'), COALESCE(MAX(log_id), 1)) FROM audit_log;


INSERT INTO organizer (organizer_id, organization_name, contact_name, email, phone) VALUES
(3, 'Startup Hub', 'Neha', 'startup@hub.com', '8888888883'),
(4, 'Art Circle', 'Vikram', 'art@circle.com', '8888888884'),
(5, 'Event Masters', 'Sanya', 'event@masters.com', '8888888885')
ON CONFLICT (organizer_id) DO NOTHING;

INSERT INTO venue (venue_id, name, address, city, capacity) VALUES
(3, 'Grand Hall', 'MG Road', 'Bangalore', 300),
(4, 'Sky Arena', 'Indiranagar', 'Bangalore', 400),
(5, 'Expo Center', 'OMR Road', 'Chennai', 600)
ON CONFLICT (venue_id) DO NOTHING;



INSERT INTO event (event_id, organizer_id, category_id, title, description, image_url, price, language, duration_minutes) VALUES
(6, 3, 1, 'Startup Summit', '', '', 499, 'English', 180),
(7, 4, 3, 'Modern Art Fest', '', '', 199, 'English', 120),
(8, 5, 2, 'Rock Night', '', '', 699, 'English', 150)
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO showtime (showtime_id, event_id, venue_id, start_time, end_time) VALUES
(6, 1, 3, NOW() + interval '1 day', NOW() + interval '1 day 2 hours'),
(7, 2, 4, NOW() + interval '2 days', NOW() + interval '2 days 3 hours'),
(8, 3, 5, NOW() + interval '3 days', NOW() + interval '3 days 2 hours'),
(9, 4, 3, NOW() + interval '4 days', NOW() + interval '4 days 2.5 hours'),
(10, 5, 4, NOW() + interval '5 days', NOW() + interval '5 days 4 hours'),
(11, 6, 5, NOW() + interval '1 day 5 hours', NOW() + interval '1 day 8 hours'),
(12, 7, 3, NOW() + interval '2 days 6 hours', NOW() + interval '2 days 8 hours'),
(13, 8, 4, NOW() + interval '3 days 7 hours', NOW() + interval '3 days 10 hours')
ON CONFLICT (showtime_id) DO NOTHING;