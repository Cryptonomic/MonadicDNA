use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use rusqlite::{params, Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

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
    frequencies: HashMap<String, i32>,
}

async fn put_dataset(state: web::Data<AppState>, user_id: web::Query<UserId>, body: web::Bytes) -> impl Responder {
    let conn = state.db.lock().unwrap();
    let result: SqliteResult<()> = conn.execute(
        "INSERT OR REPLACE INTO datasets (user_id, data) VALUES (?1, ?2)",
        params![user_id.user_id, body.to_vec()],
    ).map(|_| ());

    match result {
        Ok(_) => HttpResponse::Ok().json(SuccessResponse { success: true }),
        Err(_) => HttpResponse::InternalServerError().json(SuccessResponse { success: false }),
    }
}

async fn get_dataset(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    let conn = state.db.lock().unwrap();
    let result: SqliteResult<Vec<u8>> = conn.query_row(
        "SELECT data FROM datasets WHERE user_id = ?1",
        params![user_id.user_id],
        |row| row.get(0),
    );

    match result {
        Ok(data) => HttpResponse::Ok().body(data),
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

async fn get_thrombosis(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    // This is a placeholder implementation. You should replace it with actual logic.
    HttpResponse::Ok().json(false)
}

async fn get_frequencies(state: web::Data<AppState>, user_id: web::Query<UserId>) -> impl Responder {
    // This is a placeholder implementation. You should replace it with actual logic.
    let frequencies = HashMap::from([
        ("example".to_string(), 1),
        ("placeholder".to_string(), 2),
    ]);
    HttpResponse::Ok().json(FrequenciesResponse { frequencies })
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
        .bind("127.0.0.1:6174")?
        .run()
        .await
}
