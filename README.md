# Project Setup Guide

## Environment Variables

- Run `cp .env.example .env` if not already exists
- Setup environments in .env
- Run `npm i -g yarn run-rs`
- Run `yarn`
- Run `run-rs --mongod` because transactions in mongoDB needs replica sets -> without this step you wont be able to create order
- Run `yarn start` and your project will be running on `localhost:4000`
- Postman collection is already added in root folder named as `bar.postman_collection.json`

### Note: This project uses mongodb for the database
