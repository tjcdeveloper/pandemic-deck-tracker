// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::str::FromStr;
use sqlite::Value;

const DB_PATH: &str = "./db.sqlite";

#[derive(Deserialize, Serialize, Clone, Debug)]
enum CardColour {
    BLACK,
    BLUE,
    YELLOW,
}

impl FromStr for CardColour {
    type Err = ();

    fn from_str(colour: &str) -> Result<Self, Self::Err> {
        match colour {
            "BLACK" => Ok(CardColour::BLACK),
            "BLUE" => Ok(CardColour::BLUE),
            "YELLOW" => Ok(CardColour::YELLOW),
            _ => Err(())
        }
    }
}

impl From<CardColour> for Value {
    fn from(value: CardColour) -> Self {
        match value {
            CardColour::BLACK => Value::String(String::from("BLACK")),
            CardColour::BLUE => Value::String(String::from("BLUE")),
            CardColour::YELLOW => Value::String(String::from("YELLOW")),
        }
    }
}

#[derive(Serialize, Debug)]
struct Card {
    id: u8,
    card_name: String,
    number_of_copies: u8,
    colour: CardColour,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn load_deck() -> String {
    let mut deck: Vec<Card> = Vec::new();
    let connection = sqlite::open(DB_PATH).unwrap();
    let query = "SELECT id, card_name, number_of_copies, colour FROM Deck ORDER BY id DESC";
    connection
        .iterate(query, |row| {
            deck.push(Card {
                id: row.get(0).unwrap().1.unwrap().parse::<u8>().unwrap(),
                card_name: String::from(row.get(1).unwrap().1.unwrap()),
                number_of_copies: row.get(2).unwrap().1.unwrap().parse::<u8>().unwrap(),
                colour: row.get(3).unwrap().1.unwrap().parse::<CardColour>().unwrap(),
            });
            true
        })
        .unwrap();
    serde_json::to_string(&deck).unwrap()
}

#[tauri::command]
fn create_city(card_name: String, number_of_copies: i64, colour: CardColour) -> String {

    let mut new_id: u8 = 0;
    let connection = sqlite::open(DB_PATH).unwrap();
    let query = "INSERT INTO Deck (card_name, number_of_copies, colour) \
        VALUES (:card_name, :number_of_copies, :colour)";
    let mut statement = connection.prepare(query).unwrap();
    statement.bind_iter::<_, (_, sqlite::Value)>([
        (":card_name", card_name.clone().into()),
        (":number_of_copies", number_of_copies.into()),
        (":colour", colour.clone().into()),
    ]).unwrap();
    statement.next().unwrap();

    let query = "SELECT last_insert_rowid();";
    connection
        .iterate(query, |row| {
            new_id = row.get(0).unwrap().1.unwrap().parse::<u8>().unwrap();
            true
        })
        .unwrap();
    serde_json::to_string(&Card {
        id: new_id,
        card_name: card_name,
        number_of_copies: u8::try_from(number_of_copies).unwrap(),
        colour: colour,
    }).unwrap()
}

fn create_db_if_necessary() {
    match File::create_new(DB_PATH) {
        Ok(_) => {
            let connection = sqlite::open(DB_PATH).unwrap();
            connection.execute("PRAGMA encoding = 'UTF-8'").unwrap();
            connection.execute(
                "CREATE TABLE IF NOT EXISTS Deck(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    card_name TEXT NOT NULL UNIQUE,
                    number_of_copies INT NOT NULL DEFAULT(3),
                    colour TEXT CHECK(colour IN ('BLACK', 'BLUE', 'YELLOW')) NOT NULL
                )"
            ).unwrap();
            connection.execute(
                "REPLACE INTO Deck (id, card_name, colour)
                VALUES (1, 'New York', 'BLUE'),
                       (2, 'Washington', 'BLUE'),
                       (3, 'Jacksonville', 'YELLOW'),
                       (4, 'São Paulo', 'YELLOW'),
                       (5, 'London', 'BLUE'),
                       (6, 'Istanbul', 'BLACK'),
                       (7, 'Tripoli', 'BLACK'),
                       (8, 'Cairo', 'BLACK'),
                       (9, 'Lagos', 'YELLOW')"
            ).unwrap();
        },
        Err(ref e) if e.kind() == std::io::ErrorKind::AlreadyExists => {},
        Err(e) => panic!("Unable to create database {:?}", e),
    };
}

fn main() {
    create_db_if_necessary();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_deck, create_city])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
