const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Task {
    id: ID!
    name: String!
    isActive: Boolean!
    createdAt: Int
    updatedAt: Int
    owner: String
  }

  type Query {
    tasks(activeOnly: Boolean): [Task]
    task(id: ID!): Task #1
  }

  # ❶
  type Mutation { 
    addTask(name: String!): [Task]
    completeTask(id: ID!): [Task]
    deleteTask(id: ID!): [Task]
  }
`;

const tasks = [
  { id: 1, name: "Soak in an Onsen", isActive: true },
  { id: 2, name: "Sing Karaoke", isActive: false },
  { id: 3, name: "See cherry blossom", isActive: true },
]

const newId = () => { return !tasks.length ? 1 : Math.max(...tasks.map((t) => t.id)) + 1 }
const now = () => { return Math.floor(Date.now()/1000) }

const resolvers = {
  Query: {
    //tasks: () => tasks,
    tasks (parent, args, context, info) {
      console.log('args', args);
      const { activeOnly } = args;
      if (activeOnly) {
        return context.db.filter((task) => task.isActive == true)
      } else {
        return tasks
      }
    },
    task (parent, args, context, info) {
      const { id } = args;
      return context.db.find((task) => task.id == id)
    }
  },
  Mutation: {
    addTask: async (parent, args, context) => {
      context.db.push({
        id: newId(),
        ...args,
        isActive: true,
        createdAt: now(),
        updatedAt: now()
      }) 
      return context.db
    },
    completeTask: async (parent, args, context) => {
      const targetTask = context.db.find(t => t.id == args.id)

      if (!targetTask) {
        throw new Error("No such task")
      } else {
        const idx = context.db.indexOf(targetTask)
        context.db[idx].isActive = !context.db[idx].isActive; 
        context.db[idx].updatedAt = now(); 
        return context.db
      }

    },
    deleteTask: async (parent, task, context) => {
      const targetTask = context.db.find(t => t.id == task.id)

      if (!targetTask) {
        throw new Error("No such task")
      } else {
        const idx = context.db.indexOf(targetTask)
        context.db.splice(idx, 1); 
        return context.db
      }

    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { db: tasks } 
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
