mod common;
mod diabetes;
mod prover;

use prover::run_prover;
use std::thread;

fn main() {
    println!("Starting computation");
    let thread_join_handle = thread::spawn(move || run_prover());
    // some work here
    println!("Awaiting computation");
    let res = thread_join_handle.join();
    println!("Completed computation");
}
