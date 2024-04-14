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

`curl -i -X PUT -F "file=@testdata/hu278AF5_20210124151934.txt" http://127.0.0.1:5000/dataset`

This will return Nillion store IDs for all the SNPs of interest:

```json
{
  "rs10811661": "5d4448fb-60e9-4fda-8020-da006f405acd",
  "rs1111875": "570f77a1-9e33-439d-8f4c-a0ce2e7e2d94",
  "rs13266634": "0bf13aae-4d72-47a3-baef-2f07fb27e890",
  "rs1801282": "1dcf1018-f6d9-4ebc-b435-8df3dca78707",
  "rs1815739": "ea64a530-1f64-49e5-8d9c-f57d16674a55",
  "rs4402960": "3bdda1dd-7aac-448b-9219-618047fb54e9",
  "rs5219": "d53aaa3d-09a8-43c7-8c49-316009b38284",
  "rs6025": "87253aa0-d93b-4897-aad2-689c270134e1",
  "rs7754840": "64ba9f63-d4a7-4c73-974e-484afae70486",
  "rs7903146": "87b8ced5-81eb-4879-9e2d-601dfbad411a",
  "rs8050136": "060a0fd1-acc4-422e-9ca0-d1797f14e4e1",
  "rs9300039": "b9c46899-68b7-4bf0-bbf8-4fd6c3e6b070"
}
```

To run a Nillion computation to fetch a genomic result, run the following and provide a store ID from above corresponding to the SNP of interest. For example, for evaluating thrombosis we care about the SNP rs6025:

`curl -i -X POST http://127.0.0.1:5000/computations/thrombosis -H "Content-Type: application/json" -d '{"store_id": "87253aa0-d93b-4897-aad2-689c270134e1"}'`

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

To test a Nillion program:

`nada-run -i snp=6 -i genotype=12  binaries/thrombosis.nada.bin`
