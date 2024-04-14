PRAGMA encoding = 'UTF-8';

CREATE TABLE IF NOT EXISTS Deck(
                                   id INT PRIMARY KEY,
                                   card_name TEXT NOT NULL UNIQUE,
                                   number_of_copies INT NOT NULL DEFAULT(3)
    );

INSERT INTO Deck (id, card_name)
VALUES (1, 'New York'),
       (2, 'Washington'),
       (3, 'Jacksonville'),
       (4, 'São Paulo'),
       (5, 'London'),
       (6, 'Istanbul'),
       (7, 'Tripoli'),
       (8, 'Cairo'),
       (9, 'Lagos');