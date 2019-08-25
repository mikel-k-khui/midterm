DELETE FROM users;
DELETE FROM list;
DELETE FROM item;
DELETE FROM users_lists;

INSERT INTO users (name, email, password, created_at)
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

INSERT INTO lists (name)
VALUES ('To buy', 'buy'),
('To eat', 'eat'),
('To watch', 'watch'),
('To read', 'read'),
 ('To buy', 'buy'),
('To eat', 'eat'),
('To watch', 'watch'),
('To read', 'read'),
('To buy', 'buy'),
('To eat', 'eat'),
('To watch', 'watch'),
('To read', 'read'),
 ('To buy', 'buy'),
('To eat', 'eat'),
('To watch', 'watch'),
('To read', 'read'),
 ('To buy', 'buy'),
('To eat', 'eat'),
('To watch', 'watch'),
('To read', 'read');

INSERT INTO users_lists (created_by, user_id, list_id)
VALUES (1,1,1),(2,2,2),(3,3,3),(4,4,4),(5,5,5),(6,6,6),(7,7,7),(8,8,8),(9,9,9),(10,10,10),(11,11,11),(12,12,12),(13,13,13),(1,1,14),(2,2,15),(3,3,16),(4,4,17),(5,5,18),(6,6,19),(7,7,20);

INSERT INTO tasks (list_id, last_modified, description)
VALUES (1,'2019-03-12T08:06:00.000Z','Harry Potter theme park'),
(2,'2019-03-12T08:06:00.000Z','Star Wars themed cookies'),
(3,'2019-03-12T08:06:00.000Z','Star Wars Episode III'),
(4,'2019-03-12T08:06:00.000Z','Star Wars Episode III'),
(5,'2019-03-12T08:06:00.000Z','Hobbit'),
(6,'2019-03-12T08:06:00.000Z','Home made smoked meat'),
(7,'2019-07-12T08:06:00.000Z','Hobbit'),
(8,'2019-07-12T08:06:00.000Z','Hobbit'),
(9,'2019-07-12T08:06:00.000Z','Harry Potter theme park'),
(10,'2019-07-12T08:06:00.000Z','Harry Potter theme park'),
(11,'2019-07-12T08:06:00.000Z','Harry Potter theme park'),
(12,'2019-07-12T08:06:00.000Z','Harry Potter theme park'),
(13,'2019-07-12T08:06:00.000Z','Action figures'),
(14,'2019-07-12T08:06:00.000Z','Chocolate'),
(15,'2019-07-12T08:06:00.000Z','How to get away with murder'),
(16,'2019-07-12T08:06:00.000Z','Hungar Games'),
(17,'2019-07-12T08:06:00.000Z','Present for mom'),
(18,'2019-07-12T08:06:00.000Z','Tacos at Extreme Tacos'),
(1,'2019-07-12T08:06:00.000Z','Harry Potter theme park'),
(2,'2019-07-12T08:06:00.000Z','Poems by the artist at the poetry last thursday'),
(3,'2019-07-12T08:06:00.000Z','Lightsaber'),
(4,'2019-07-12T08:06:00.000Z','Chinese buffet at chinatown'),
(5,'2019-07-12T08:06:00.000Z','Stranger Things');
