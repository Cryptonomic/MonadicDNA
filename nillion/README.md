# MondadicDNA

## Overview
MondadicDNA is a project focused on secure personal genomics utilizing cryptography. The primary objective is to ensure the privacy and security of genome data by leveraging cryptographic techniques. This repository contains code for splitting genome data into 110KB chunks and storing them on the Filecoin network via Lighthouse.

## Usage
To utilize the functionalities provided by MondadicDNA Data services, follow the instructions below:

1. **Navigate to Filecoin Rust Directory**: The core functionality for splitting genome data and storing it on Filecoin via Lighthouse is contained within the `filecoin_rust` directory. Navigate to this directory using the command line:

    ```bash
    cd filecoin_rust/filecoin_uploader/src/main.rs
    ```

3. **Split Genome Data**: Within the `filecoin_rust` directory, you can find the code responsible for splitting genome data into 110KB chunks. Execute this code to perform the splitting process.

4. **Storage and Retrieval**: Genome data chunks can be stored on the Filecoin network via Lighthouse. To retrieve specific chunks, navigate to the `store_retrieve` directory and utilize the code provided. The filename for retrieval code is `nillion_lighthouse.py`.

## Repository Structure
- **filecoin_rust**: Contains code for splitting genome data into 110KB chunks and storing them on the Filecoin network via Lighthouse.
- **store_retrieve**: Includes code for retrieving genome data chunks stored on the Filecoin network.


