An exampe app using Express, Node, GraphQL and JSON Server.

Query companies and CRUD users.

# Run
```
git clone
npm install
npm run dev
```

# Start Json Server
```
npm run json:server

// Notes: you can browse json-server
// Go to: http://localhost:3000

// Visit a specific resources:
//  http://localhost:3000/users
//  http://localhost:3000/users/23
//  http://localhost:3000/companies/2/users
```


# Run GraphiQL IDE
Go to http://localhost:4000/graphql

Run GraphQL queries ...

e.g.
```
{
  company(id: "1") {
    id
    name
    description
    users {
      firstName
      age
    }
  }
}
```
