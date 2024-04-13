# RISC Zero Project Setup Guide

This branch contains the code necessary to set up a RISC Zero project.

## Instructions

1. Ensure you are on the `amar/risc_zero` branch of the repository.

2. Navigate to the `mtDog/lib/mt-dog` folder in your terminal:

    ```bash
    cd mtDog/lib/mt-dog
    ```

3. Run the following command to execute the code in **DEV MODE** (faster, without generating ZK proofs):

    ```bash
    RISC0_DEV_MODE=1 cargo run
    ```

4. Alternatively, to run the code with proof generation, execute the following command:

    ```bash
    RISC0_DEV_MODE=0 cargo run
    ```


