# Nillion Interactor

Microservice for encapsulating Nillion interactions

For development, don't forget to run inside a Python virtual environment.

## Commands

Run the API:

`python app.py`

Invoke the API:

```
curl -i -X PUT -F "file=@testdata/hu278AF5_20210124151934.txt" http://127.0.0.1:5000/dataset

curl -i -X POST http://127.0.0.1:5000/computations/thrombosis -H "Content-Type: application/json" -d '{"store_id": "b9c46899-68b7-4bf0-bbf8-4fd6c3e6b070"}'
```

## Working with the Nillion program

Compile:

`./compile.sh`

Testing example:

```nada-run -i snp=6 -i genotype=9  binaries/lactose_tolerance.nada.bin`
