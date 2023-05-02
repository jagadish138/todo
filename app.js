const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");

app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");
let todoData = null;
const intializeDbAndServer = async () => {
  try {
    todoData = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`db error:${e.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();

const conatinsSatusAndPrior = (value) => {
  return value.search_q !== undefined && priority !== undefined;
};
const conatinsOnlySatus = (value) => {
  return value.status !== undefined;
};
const conatinsOnlyPrior = (value) => {
  return value.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;

  let data = null;
  let getQueryValue = "";

  switch (true) {
    case conatinsOnlySatus(request.query):
      getQueryValue = `
            SELECT *
           FROM todo
           WHERE 
           todo LIKE "${search_q}" AND status=${status};
           
           `;

      break;
    case conatinsOnlyPrior(request.query):
      getQueryValue = `
            SELECT *
           FROM todo
           WHERE 
           todo LIKE "${search_q}" AND priority=${priority};
           
           `;

      break;
    case conatinsSatusAndPrior(request.query):
      getQueryValue = `
            SELECT *
           FROM todo
           WHERE 
           todo LIKE "${search_q}" AND priority=${priority} AND status=${status};
           
           `;

      break;

    default:
      getQueryValue = `
            SELECT *
           FROM todo
           WHERE 
           todo LIKE "${search_q}";
           
           `;
      break;
  }
  data = await todoData.all(getQueryValue);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const pertiTodo = `
    SELECT *
    FROM todo
    where
    id=${todoId};
    `;
  let reqQuery = await todoData.get(pertiTodo);
  response.send(reqQuery);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  let newAddQuery = `
    INSERT INTO todo
    (id,todo,priority,status)
    VALUES(
       '${id}','${todo}','${priority}','${status}'
    )
    `;
  const newValue = await todoData.run(newAddQuery);
  response.send("Todo Successfully Added");
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateCol = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateCol = "status";
      break;
    case requestBody.todo !== undefined:
      updateCol = "todo";
      break;
    case requestBody.priority !== undefined:
      updateCol = "Priority";
      break;
  }

  const oldQuery = `
    SELECT
    *
    FROM todo
    WHERE
    id=${todoId}
   
    `;
  let gotOldQuery = await todoData.get(oldQuery);
  const {
    id = gotOldQuery.id,
    todo = gotOldQuery.todo,
    priority = gotOldQuery.priority,
    status = gotOldQuery.status,
  } = request.body;

  const updateQuery = `
UPDATE todo
SET 
todo=${todo},
priority=${priority},
status=${status}
WHERE id=${todoId}
`;
  let got = await todoData.run(updateQuery);
  response.send(`${updateCol} updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    SELECT *
    FROM todo
    where
    id=${todoId};
    `;
  let deleteQuery = await todoData.run(deleteTodo);
  response.send("Todo Deleted");
});

module.export = app;
