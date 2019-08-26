DELETE FROM users;
DELETE FROM tasks;

INSERT INTO users (full_name, email, password, created_at)
VALUES ('Bart Simpson', 'bart@simpson.s', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2019-02-12T08:06:00.000Z'),
('Stever Rogers', 'captain@avengers.org', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-03-12T08:06:00.000Z'),
('Doctor Stephen Strange', 'sanctum@sancto.rum', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-04-12T08:06:00.000Z'),
('Brian Miles', 'charliemacdonald@aol.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-05-12T08:06:00.000Z'),
('Violet Parks', 'carsono''connor@outlook.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-06-12T08:06:00.000Z'),
('Edna Mack', 'elijahwiggins@inbox.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-07-12T08:06:00.000Z'),
('Jacob Houston', 'declanrhodes@google.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-08-12T08:06:00.000Z'),
('Peter Holmes', 'joshuamccarthy@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-02-13T08:06:00.000Z'),
('Eric Stevenson', 'tylerromero@inbox.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-02-14T08:06:00.000Z'),
('Vernon Miles', 'carsonbowers@outlook.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-02-15T08:06:00.000Z'),
('Steve Reynolds', 'alainarich@aol.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-03-12T08:06:00.000Z'),
('Irene Vega', 'reaganshaffer@live.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2018-02-15T08:06:00.000Z'),
('Georgie Sutton', 'alexandraellis@inbox.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.', '2019-02-12T08:06:00.000Z');


INSERT INTO tasks (user_id, last_modified, description, category)
VALUES (1,'2019-03-12T08:06:00.000Z','Harry Potter theme park', 'eat'),
(1,'2019-03-12T08:06:00.000Z','Star Wars themed cookies', 'eat'),
(1,'2019-03-12T08:06:00.000Z','Star Wars Episode III', 'watch'),
(1,'2019-03-12T08:06:00.000Z','Star Wars Episode III: The Book', 'read'),
(1,'2019-03-12T08:06:00.000Z','Hobbit', 'read'),
(1,'2019-03-12T08:06:00.000Z','Home made smoked meat', 'eat'),
(1,'2019-07-12T08:06:00.000Z','Hobbit: Part 1', 'watch'),
(1,'2019-07-12T08:06:00.000Z','The Hobbit', 'read'),
(1,'2019-07-12T08:06:00.000Z','Harry Potter', 'watch'),
(1,'2019-07-12T08:06:00.000Z','Harry Potter', 'read'),
(1,'2019-07-12T08:06:00.000Z','Harry Potter Theme Park Tickets', 'buy'),
(2,'2019-07-12T08:06:00.000Z','Harry Potter Restaurant', 'eat'),
(2,'2019-07-12T08:06:00.000Z','Action figures', 'buy'),
(2,'2019-07-12T08:06:00.000Z','Chocolate', 'eat'),
(2,'2019-07-12T08:06:00.000Z','How to get away with murder', 'read'),
(2,'2019-07-12T08:06:00.000Z','Hunger Games', 'read'),
(2,'2019-07-12T08:06:00.000Z','Present for mom', 'buy'),
(3,'2019-07-12T08:06:00.000Z','Tacos at Extreme Tacos', 'eat'),
(3,'2019-07-12T08:06:00.000Z','Harry Potter theme park tickets', 'buy'),
(3,'2019-07-12T08:06:00.000Z','Poems by the artist at the poetry last thursday', 'read'),
(3,'2019-07-12T08:06:00.000Z','Lightsaber', 'buy'),
(4,'2019-07-12T08:06:00.000Z','Chinese buffet at chinatown', 'eat'),
(5,'2019-07-12T08:06:00.000Z','Stranger Things', 'watch');
