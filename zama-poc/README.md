# Zama PoC

This codebase serves as a proof of concept for implementing MonadicDNA functionality using [Zama's fully homomorphic encryption](https://docs.zama.ai/tfhe-rs) capabilities. 

## Components

- `src/main.rs` : A single end to end program to test all functionality. 
- `src/server.ts`: A REST API to expose all available functionality
- `src/client.ts`: Client code to test the REST API

## Running the Code

Unzip `GFGFilteredUnphasedGenotypes23andMe.zip` to make the input data available. The resulting file represents SNP data downloaded from 23andMe for a single individual.

### As a Single End to End Program

`cargo run --bin main`

Change `num_lines` in `main.rs` to control the amount of data being processed. 

### As a Client / Server System

`cargo run  --bin server`

`cargo run  --bin client`

Change `num_lines` in `client.rs` to control the amount of data being processed. 

Delete `database.db` to reset the system. The file represents a SQLite database into which encrypted user data is written. 
