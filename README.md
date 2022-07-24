# ditto

### Ports

- Server API Port: 7000
- Client SHOP Port: 9000
- Client SHOP API Port: 8000
- Client ADMIN Port: 5000 (3000)
- Client ADMIN API Port: 4000


# Ditto Fashion Documentation


here are all the tabs and language settings: client/packages/shop/src/site-settings/site-navigation.ts

# Bugs:
1- clear session, login, logout, crash on src/pages/index.tsx (63:12) @ IndexPage


# Introduction

This is a ecommerce script devided with two parts; one is `Client` and another one is `Server`. In the `Client` we have shop script template develop with `Next.js` and admin script that develop with `React.js`. In the `Server` we have graphql api that develop with `Typescript`, `Apollo Server`, and `MongoDB` as database.

# Tech We Have Used For Client

We have used monorepo folder structure with Yarn Workspace. In our template we have three different part Admin Dashboard, Shop and API. Tech specification for specific part is given below

## Admin Dashboard

- CRA
- Apollo
- BaseUI
- Typescript
- React Hook Form

## Shop

- NextJs
- Apollo
- Typescript
- Styled Components
- Stripe Integration
- Formik

## Dummy API

- GraphQL
- Type GraphQL

# Getting Started & Installation

For getting started with the template you have to follow the below procedure. First navigate to the `client` directory. Then run below command for getting started with specific part.

```bash
# on client directory
yarn
```

<br><br><br>

## Admin
### Configuration

1. Go to `/packages/admin` folder.
1. Copy the contents of `.env.sample` into a new file called `.env`
1. Put Your Graphql api endpoint in the `/packages/admin/.env` file's `REACT_APP_API_URL` key.

For starting the admin dashboard part with corresponding api data run below commands.

```bash
# for dev mode run below command
yarn dev:admin

```

## Shop

### Configuration

1. Go to `/packages/shop` folder.
1. Copy the contents of `.env.local.sample` into a new file called `.env.local`
1. Put Your Stripe public api key in the `/packages/shop/.env.local` file's `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` key.

For starting the shop part with corresponding api run below commands.

```bash
# for dev mode run below command
yarn dev:shop

```

### If you want to test your production build admin or shop in local environment then run the below commands.

## Admin

```bash
# build admin for production
yarn build:admin => port: 5000

# build api which in needed for local testing
yarn build:api => port: 4000

#start admin in production mode
yarn serve:admin
```

<br><br><br><br><br><br><br>

## Shop

```bash
# build shop for production
yarn build:shop => port: 9000

# build api which in needed for local testing
yarn build:api => port: 8000

# start shop in production mode
yarn serve:shop
```

# Folder Structure & Customization

`/packages/admin` : In this portion all the admin dashboard related coding and functions.

`/packages/shop` : All the shop related coding and functions.

`/packages/api` : API related code for both admin and shop section.

admin related api codes are in `admin` folder

shop related codes are in `shop` folder


### Admin

- After deploying the api you will get the api endpoint url. Put that url in the `packages/admin/.env`

```
REACT_APP_API_URL={put_your_api_url_here}/admin/graphql;
```

### Shop

- After deploying the api you will get the api endpoint url. Put that url in the `packages/shop/.env.local`.

```.env.local
NEXT_PUBLIC_STRIPE_PUBLIC_KEY= 'put_your_stripe_public_key'

NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here.}/shop/graphql'
```

<br><br><br><br>
<br><br><br><br>

# Tech We Have Used For Server
We develop our graphql api server with NPM workspace. Tech specification for specific part is given below

## API Server
- Typescript (Node.js)
- Express
- Apollo Server Express
- Cors
- Graphql
- Mongodb

# Getting Started & Installation

For getting started with the api server you have to follow the below procedure. First navigate to the `server` directory. Then run below command for getting started with specific part.

```bash
# on server directory
npm install
```


## API Server
### Configuration

1. Go to `server` folder.
1. Copy the contents of `.env.example` into a new file called `.env`
1. Put Your configuration in the `server/.env` file's.
   1. `PORT=` Give port as `7000`. The server will run on this port.
   1. `APP_ENV=` Set environment `local` if you have `MongoDB` on your local machine. If you have `MongoDB Atlas` then set environment as `production`.
   1. `JWT_SECRET=` Give random string here to setup JWT secret key.
### Configure environment with MongoDB Atlas
If you wish you can also use this configuration for development envoirment.
```
PORT=7000
APP_ENV=production
DB_NAME=pickbazar
DB_USER=pickbazar
DB_USER_PASSWORD=58iqLgIruPZpNG5s
DB_CLUSTER=cluster0.nneth
JWT_SECRET=welkrjewrrkjdsfdk
```
### Configure environment with local MongoDB
Please be sure you already create the database on your local mongodb server.
```
PORT=7000
APP_ENV=local
DB_NAME=pickbazar
DB_URL=mongodb://localhost:27017
JWT_SECRET=welkrjewrrkjdsfdk
```


For starting the api server run below commands. The api server will run on `http://localhost:7000` and you will find the graphql api on this url `http://localhost:7000/api`. 

**You will find API Specification on Graphql playground docs.** 

```bash
# for dev mode run below command
npm run start

```

### Backlog:
Connect ALL app features to backend (shop and admin)

ADMIN
  Products page

	delete products

	update/delete categories

 update/delete/create categories-types

Customers page

 update/delete/create customers

 add primary delivery address field
  
Dashboard

 make it show real data

 Settings

  members:
  
 delete/edit permissions or role site settings:
  
 make logo/site name (PickBazar should be a dynamic variable)/site description and status work correctly 
  
 a plus if you can define theme colors and different website settings 

Coupons
  
 add/edit coupon
add not working actually


Cool features:
 - Add feature to edit your homepage background banner image. And what does ads banners hyperlinks takes you to
- products page: ability to change display options (listing view, add products with excel file, show products out of stock, set new price for a number of products selected)
- a new tab to set marketing campaigns (hit instagram api and upload stuff maybe?)
- Send email capabilities (special emails form specific buyers) (maaaybe)
-SUPERADMIN: (new app) to be able for us to control bugs (from logs maybe), up/down statuses from all mango sites being sold.

SHOP

 Checkout Page

 Add sign up to save your delivery information

 Add countries payment methods (stripe, Apple Pay, PayPal in usa, mercadopago argentina)

Cool features:

 Delivery app (login as delivery boy) and the user can accept a delivery on real time (would include to add a view to admin panel and clients app to see the delivery status)

 Add address checker to get the delivery fee or if you qualify as free delivery (check LocationModal)
