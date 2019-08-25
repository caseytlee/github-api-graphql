require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const { HttpLink } = require("apollo-link-http");
const { setContext } = require("apollo-link-context");
const {
  introspectSchema,
  makeRemoteExecutableSchema
} = require("graphql-tools");
const fetch = require("node-fetch");

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error("You must have GITHUB_ACCESS_TOKEN set in the environment.");
}

const gitHubLink = setContext(() => ({
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`
  }
})).concat(new HttpLink({ uri: "https://api.github.com/graphql", fetch }));

const startServer = async () => {
  const gitHubRemoteSchema = await introspectSchema(gitHubLink);

  const gitHubSchema = makeRemoteExecutableSchema({
    schema: gitHubRemoteSchema,
    link: gitHubLink
  });

  const server = new ApolloServer({ cors: false, schema: gitHubSchema });

  return await server.listen({ port: process.env.PORT || 4000 });
};

startServer().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
