// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::Serialize;
use std::fs::File;

const DB_PATH: &str = "./database/db.sqlite";

#[derive(Serialize)]
struct Card {
    id: u8,
    card_name: String,
    number_of_copies: u8
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn load_deck() -> String {
    let mut deck: Vec<Card> = Vec::new();
    let connection = sqlite::open(DB_PATH).unwrap();
    let query = "SELECT id, card_name, number_of_copies FROM Deck ORDER BY id DESC";
    connection
        .iterate(query, |row| {
            deck.push(Card {
                id: row.get(0).unwrap().1.unwrap().parse::<u8>().unwrap(),
                card_name: String::from(row.get(1).unwrap().1.unwrap()),
                number_of_copies: row.get(2).unwrap().1.unwrap().parse::<u8>().unwrap()
            });
            true
        })
        .unwrap();
    serde_json::to_string(&deck).unwrap()
}

fn create_db_if_necessary() {
   match File::create_new(DB_PATH) {
        Ok(_) => {},
        Err(ref e) if e.kind() == std::io::ErrorKind::AlreadyExists => {},
        Err(e) => panic!("Unable to create database {:?}", e),
    };
}

fn main() {
    create_db_if_necessary();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_deck])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
