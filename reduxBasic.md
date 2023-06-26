
### Redux 层级关系 

Action => Reducer => Store => UI Component

eg: Todo list
Amy click "Add todo" button, trigger action to add a new todo list

Then call the dispatch action to reducer tp refresh the state

Then **store** receive(hear) this action, call **reducer function** to renew state(todo list). Then reducer will add a new object to state

before state:[{ text: 'Walk the dog' }, { text: 'Buy groceries' }]
after state:[{ text: 'Walk the dog' }, { text: 'Buy groceries' }, { text: 'Feed the cat' }]

when the state change , the **UI** will refresh and display the new todo list.

### Code
```javascript
const ADD_TODO = 'ADD_TODO'

function addTodo(text) {
  return {//action
    type: ADD_TODO,
    text: 'Feed the cat'
  }
}

dispatch(addTodo('Feed the cat'))  // 派发(dispatch) action

//store call reducer function to renew state(todo list)
//state:before, action.type: addTodo.ADD_TODO
function todoReducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, { text: action.text }]  // 返回新的state
    default: 
      return state
  }
}



```