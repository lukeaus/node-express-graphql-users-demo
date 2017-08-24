// this file tells GraphQL about the type of data in our application
const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// order of definition is important
// needs to be defined above UserType
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // use a callback so that we don't get a ReferenceError when trying to import UserType
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    // many users associated with one company
    // tell GraphQL it should expect to get multiple users
    // so wrap with a GraphQLList
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
          // required for compatibility between axios and GraphQL
          .then(resp => resp.data);
      }
    }
  })
});

// GraphQLObjectType tells GraphQL what properties does this object have
// 2 required properties:
//  name: string that defines the type
//  fields
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    // We treat associations as if it is another field
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data);
      }
    }
  })
});

// Allow AraphQL to jump and land on a specific node
// Ask graphQL about Users. If you give me a User id GraphQL will return a User back
// Resolve function is where we go into data store and find the data
// parentValue is frequently not used
// resolve: args is gets whatever arguments were passed into the orignal query

// all queries get sent to root query type
// take the query and enter into our graph of data
// if we specified 'user' in our query, the RootQuery goes and finds the user key inside
// of its 'fields' object.

// We specified that the query should come with an id, firstName and age
// Example query
// {
//   user(id: "23") {
//     id,
//     firstName,
//     age
//   }
// }

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // no parentValue here
      resolve(parentValue, args) {
        // graphql finds the correct user object
        // returns a raw javascript object
        // we return a plain JS object - types is automatically handled behind the scene
        // can return data or a promise
        // return _.find(users, { id: args.id });

        return axios.get(`http://localhost:3000/users/${args.id}`)
          // otherwise: { data: {firstName: 'Bill'}} and graphQL doesn't understand key data
          .then(resp => resp.data);
      }
    },
    company: {
      type: CompanyType,
      // args object tells our schema that when accessing this field, they should provide an id
      // as a string
      args: { id: { type: GraphQLString } },
      resolve(parentValie, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType ({
  name: 'Mutation',
  // The fields of the mutation describe the opearation the mutation will do
  fields: {
    // name should be descriptive of what the purpose of the mutation is
    addUser: {
      // type of data we are going to eventually return from the resolve function
      // Difference here is that you could return a dufferent type to the type you are operating on
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post('http://localhst:3000/users/', { firstName, age })
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue,  { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(resp => resp.data);
      },
      editUser: {
        type: UserType
      }
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)},
        firstName: { type: GraphQLString },
        age: {type: GraphQLInt },
        companyID: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        // axios.method(url, body)
        // json-server will ignore an updated id so you can't overwrite it
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(resp => resp.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
