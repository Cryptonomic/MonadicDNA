use actix_web::{web, App, HttpServer, Responder, HttpResponse, Error};
use rusqlite::{params, Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tfhe::{FheBool, FheUint8};
use zama_poc::zama_compute::{deserialize_encrypted_genotypes, check_genotype, get_genotype_frequencies};

use futures::StreamExt; // Required for stream handling methods like next()

struct AppState {
    db: Mutex<Connection>,
}

#[derive(Deserialize)]
struct UserId {
    user_id: String,
}

#[derive(Serialize)]
struct SuccessResponse {
    success: bool,
}

#[derive(Serialize)]
struct FrequenciesResponse {
    frequencies: Vec<FheUint8>,
}

#[derive(Serialize)]
struct ThrombosisResponse {
    thrombosis: FheBool,
}

fn load_dataset(conn: &Connection, user_id: &str) -> SqliteResult<Vec<u8>> {
    conn.query_row(
        "SELECT data FROM datasets WHERE user_id = ?1",
        params![user_id],
        |row| row.get(0),
    )
}

async fn put_dataset(state: web::Data<AppState>, user_id: web::Query<UserId>, mut body: web::Payload) -> Result<impl Responder, Error> {
    println!("Storing a dataset...");
    let conn = state.db.lock().unwrap();

    let mut accumulated_chunks = Vec::new();
    while let Some(chunk) = body.next().await {
        let chunk = chunk?;
        accumulated_chunks.extend_from_slice(&chunk);
    }

    let result: SqliteResult<()> = conn.execute(
        "INSERT OR REPLACE INTO datasets (user_id, data) VALUES (?1, ?2)",
        params![user_id.user_id, accumulated_chunks],
    ).map(|_| ());

    match result {
        Ok(_) => Ok(HttpResponse::Ok().json(SuccessResponse { success: true })),
        Err(_) => Ok(HttpResponse::InternalServerError().json(SuccessResponse { success: false })),
    }
}

async fn get_dataset(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    println!("Fetching a dataset..");
    let conn = state.db.lock().unwrap();
    match load_dataset(&conn, &user_id.user_id) {
        Ok(data) => HttpResponse::Ok().body(data),
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

async fn get_thrombosis(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    println!("Performing thrombosis calc..");
    let conn = state.db.lock().unwrap();
    match load_dataset(&conn, &user_id.user_id) {
        Ok(data) => {
            let deserialized_encrypted_genome = deserialize_encrypted_genotypes(data);
            let target_genotype = "CC";
            let target_rsid = "rs75333668";
            match check_genotype(&deserialized_encrypted_genome, target_rsid, target_genotype) {
                Ok(thrombosis) => HttpResponse::Ok().json(ThrombosisResponse { thrombosis }),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        },
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

async fn get_frequencies(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    println!("Performing frequency calc..");
    let conn = state.db.lock().unwrap();
    match load_dataset(&conn, &user_id.user_id) {
        Ok(data) => {
            let deserialized_encrypted_genome = deserialize_encrypted_genotypes(data);
            let frequencies = get_genotype_frequencies(&deserialized_encrypted_genome, 10);
            HttpResponse::Ok().json(FrequenciesResponse { frequencies })
        },
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let conn = Connection::open("database.db").expect("Failed to open database");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS datasets (
            user_id TEXT PRIMARY KEY,
            data BLOB
        )",
        [],
    ).expect("Failed to create table");

    let state = web::Data::new(AppState {
        db: Mutex::new(conn),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .route("/dataset", web::put().to(put_dataset))
            .route("/dataset", web::get().to(get_dataset))
            .route("/thrombosis", web::get().to(get_thrombosis))
            .route("/frequencies", web::get().to(get_frequencies))
    })
        .bind("localhost:6174")?
        .run()
        .await
}
