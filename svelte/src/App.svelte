<script>
let taskName;
let activeOnly = true;
let modalOn = false;
let mcnt = 0; // mutation counter
let tid = 1;

import { InMemoryCache, ApolloClient } from '@apollo/client';
import { setClient, getClient, query, mutation } from "svelte-apollo";
import { list_tasks, get_task, add_task, complete_task, delete_task } from './schema.graphql';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache()
});
setClient(client);

const initial_tasks = query(list_tasks);
const first_task = query(get_task);

let current_tasks;
$: {
     current_tasks = initial_tasks.refetch({ activeOnly: activeOnly });
     console.log(mcnt); 
}

$: selected_task = first_task.refetch({ id: tid })

// getTask
const getTask = (taskId) => {
  modalOn = true;
  tid = taskId; 
  console.log('taskId', taskId);
}

// addTask
const add = mutation(add_task);
const addTask = async (tname) => {
  mcnt++;
  const reply = await add({ variables: { name: tname } });
  console.log('add', reply) 
};

// deleteTask
const del = mutation(delete_task);
const deleteTask = async (tid) => {
  mcnt++;
  const reply = await del({ variables: { id: tid } });
  console.log('del', reply) 
};

// completeTask
const done = mutation(complete_task);
const completeTask = async (tid) => {
  mcnt++;
  const reply = await done({ variables: { id: tid } });
  console.log('done', reply) 
};

// format date
function fd(date) {
  console.log('fd called')
  let d = new Date(parseInt(date))
  return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
}

</script>

<main>

  <h1>HELLO GRAPHQL TODO!</h1>
  <div class="container is-fluid">
    <div class="columns is-centered">
      <div class="field has-addons">
        <div class="control" style="margin-bottom: 5em;">
          <input class="input" type="text" placeholder="Add a task" bind:value={taskName}>
        </div>
        <div class="control">
          <a class="button is-danger" on:click={ () => addTask(taskName) }><i class="fas fa-plus"></i></a>
        </div>
      </div>
    </div>


    <div class="columns" style="width: 200px; margin-left: 60%; margin-bottom: 3em">
      <div class="field">
        <input id="switchRoundedDanger" type="checkbox" name="switchRoundedDanger" class="switch is-rounded is-danger is-rtl" bind:checked={activeOnly}>
        <label for="switchRoundedDanger">Active only </label>
      </div>
    </div>

    <div class="columns is-centered">
        {#await current_tasks}
          <span class="spinner-loader" style="margin-top: 10em">Loading…</span>
        {:then ct}
        <table class="table is-hoverable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Created at</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {#each ct.data.tasks as task}
              <tr>
                <td>{task.id}</td>
                <td>{task.name}</td>
                <td>{fd(task.createdAt)}</td>
                <td>{task.isActive}</td>
                <td>
                  <i class="fas fa-check" on:click={ () => completeTask(task.id) }></i> 
                  <i class="fas fa-info" on:click={ () => getTask(task.id) }></i>
                  <i class="far fa-trash-alt" on:click={ () => deleteTask(task.id) }></i>
                </td>
              </tr>
             {/each}
          </tbody>
        </table>
        {/await}
    </div>

    <div class="modal { modalOn ? 'is-active' : ''}">
      <div class="modal-background"></div>
      <div class="modal-content">
        <dev class="box">
        {#await selected_task}
          <span class="spinner-loader" style="margin-top: 10em">Loading…</span>
        {:then st}
        <table class="table is-fullwidth">
          <thead>
            <tr><td>key</td><td>value</td></tr>
          </thead>
          <tbody>
            <tr><td>id</td><td><span class="tag">{st.data.task.id}</span></td></tr>
            <tr><td>name</td><td><span class="tag">{st.data.task.name}</span></td></tr>
            <tr><td>createdAt</td><td><span class="tag">{fd(st.data.task.createdAt)}</span></td></tr>
            <tr><td>updatedAt</td><td><span class="tag">{fd(st.data.task.updatedAt)}</span></td></tr>
            <tr><td>isActive</td><td><span class="tag">{st.data.task.isActive}</span></td></tr>
            <tr><td>owner</td><td><span class="tag">{st.data.task.userId}</span></td></tr>
          </tbody>
        </table>
        {/await}
        </dev>
      </div>
      <button class="modal-close is-large" aria-label="close" on:click="{() => modalOn = false}"></button>
    </div>

  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    margin-bottom: 1.5em;
  }
  td i {
    padding: 5px;
    cursor: pointer;
    color: gray;
  }
  label { font-family: monospace; }
  table { font-family: monospace; }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
