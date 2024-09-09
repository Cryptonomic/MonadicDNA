use std::time::Instant;
use log::info;
use env_logger::{Builder, Env};

mod genome_processing;
mod zama_compute;
mod server;
mod client;

fn main() {
    Builder::from_env(Env::default().default_filter_or("info"))
        .format(|buf, record| {
            use std::io::Write;
            writeln!(buf, "{} [{}] - {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"), record.level(), record.args())
        })
        .init();

    info!("Hello, Zama!");

    let filename = "GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 10;

    let start = Instant::now();
    zama_compute::run_iteration(filename, num_lines).expect("Well, that didn't work!");
    let duration = start.elapsed();
    info!("run_iteration took: {:?}", duration);

    info!("Bye, Zama!");
}

