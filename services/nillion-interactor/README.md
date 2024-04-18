# Nillion Interactor

Microservice and API for encapsulating Nillion interactions for Monadic DNA.

## Set up

For local development, don't forget to: 
- Install Nillion using the instruction at https://docs.nillion.com/nillion-sdk-and-tools and https://docs.nillion.com/nillion-devnet
- Run `nada-devnet` to run a local Nillion network
- Run inside a Python virtual environment
- Update the path of `NILLION_USERKEY_PATH_PARTY_1` and `NILLION_NODEKEY_PATH_PARTY_1` in `.env` to reflect the local file system
- Run `python nadatest.py` to both register the required Nada programs with the local node and perform an end to end test

## Commands

### Run the API:

`python app.py`

### Invoke the API:

To provide a 23andMe dataset to the API to register secrets as appripriate on the Nillion network, run:

`curl -i -X PUT -F "file=@testdata/hu278AF5_20210124151934.txt" http://127.0.0.1:8732/dataset`

This will return Nillion store IDs for all the SNPs of interest for both Thrombosis and Muscle-performance:

```json
{
  "muscle_perform_store_ids": {
    "rs10811661": "e6a3708b-0cee-4644-88da-1bec01361beb",
    "rs1111875": "d15a775a-34f1-4440-a697-0034f0a8047c",
    "rs13266634": "40978f75-8872-489d-8815-bd0f1f2a410a",
    "rs1801282": "5a52833f-40f8-4d26-9cc8-93a82e3e553c",
    "rs1815739": "96bea732-fa02-4666-bb31-8607c3fb281a",
    "rs4402960": "5d00dc32-780c-49bd-a461-0634271d3623",
    "rs5219": "e7e42950-6fe0-41b8-b9de-2fb6f8537bf1",
    "rs6025": "a020ec8a-1789-49e5-8be7-46cc01345bff",
    "rs7754840": "15d80711-26ad-4b52-83d8-29bbcb9c6e9d",
    "rs7903146": "f3c8dbb9-6ad4-4239-af44-02a43b38e752",
    "rs8050136": "6d5959c7-6536-46a8-833b-ca1333c53201",
    "rs9300039": "24a7d836-21a6-4bba-8832-87ecf137eefa"
  },
  "thrombosis_store_ids": {
    "rs10811661": "d7e40e91-1298-443b-b82b-4efd1077ecd0",
    "rs1111875": "39c94081-5f74-4456-b250-3f2d718935eb",
    "rs13266634": "4084c460-2848-4557-8696-6225e1791ba9",
    "rs1801282": "89c1d03a-d67e-4bc6-ace8-d5d06dfbffd3",
    "rs1815739": "7e353e8a-efe4-42f7-a90a-50561fad5ce0",
    "rs4402960": "e3482f07-0c93-4fd6-8438-2a05dcec1852",
    "rs5219": "de6dfba4-aa74-4bc0-9ada-7290bd6b3bb1",
    "rs6025": "52a6cefc-7dca-4707-bb75-f405788007b4",
    "rs7754840": "6a9d9521-b0cd-4e49-8049-31250b2b0042",
    "rs7903146": "40301d40-b9a1-4e45-84d2-156f96884b40",
    "rs8050136": "bb3048da-d0ae-4627-ae7e-dcf1a1ca57c3",
    "rs9300039": "17d6512b-9203-4460-9c4a-ed1c4ee50e08"
  }
}

```

To run a Nillion computation to fetch a genomic result, run the following and provide a store ID from above corresponding to the SNP of interest. For example, for evaluating thrombosis we care about the SNP rs6025:

`curl -i -X POST http://127.0.0.1:8732/computations/thrombosis -H "Content-Type: application/json" -d '{"thrombosis_store_id": "52a6cefc-7dca-4707-bb75-f405788007b4"}'`

For evaluating muscle-performance, use:

`curl -i -X POST http://127.0.0.1:8732/computations/muscle-performance -H "Content-Type: application/json" -d '{"muscle_perform_store_id": "90f10c46-bfe9-4c8e-9206-73af60801dde"}'`


This will return a result of either 0 or 1, with the former corresponding to the absence of disease risk and the latter corresponding to the presence of diasease risk. 

```json
{
  "Result": 1
}
```

## Working with the Nillion program

To edit Nillion program, open and edit the desired program in the `programs` directory. 

To compile all Nillion programs::

`./compile.sh`

To test a Nillion program for thrombosis:

`nada-run -i snp=6 -i genotype=12  binaries/thrombosis.nada.bin`

To test a Nillion program for muscle-performance:

`nada-run -i snp=11 -i genotype=9 binaries/muscle-perform.nada.bin`

