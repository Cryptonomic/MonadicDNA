# Nillion Interactor

Microservice for encapsulating Nillion interactions

For development, don't forget to run inside a Python virtual environment.

## Commands

Run the API:

`python app.py`

Invoke the API:

curl -X PUT -F "file=@testdata/hu278AF5_20210124151934.txt" http://127.0.0.1:5000/dataset

## Working with the Nillion program

Compile:

`./compile.sh`

Testing example:

`nada-run -i snp=6 -i genotype=9  binaries/lactose_tolerance.nada.bin`
