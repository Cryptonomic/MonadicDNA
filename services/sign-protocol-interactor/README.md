# Sign Protocol API for Mt-Dog

This project implements an Express.js server for a Sign Protocol API tailored for Mt-Dog.

## Description

The Sign Protocol API allows for the creation of VerifiedTrait attestations tailored specifically for Mt-Dog.

## Usage

1. Clone the repository.
2. Navigate to the `services/sign-protocol-interactor` directory.
3. Install dependencies by running `npm install`.
4. Start the server by running `npm start`.
5. Send a POST request to `http://localhost:3000/sign/VerifiedTrait` with the following JSON payload using curl:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"passport_id": "123456789", "provider": "Mt-Dog", "trait": "custom_trait", "value": "custom_value"}' \
     http://localhost:3000/sign/VerifiedTrait