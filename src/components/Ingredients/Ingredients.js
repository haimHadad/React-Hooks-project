import React, {useReducer, useEffect, useCallback, useMemo} from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredient, action) => {
  switch(action.type){
    case 'SET': 
      return action.ingredients;
    case 'ADD':
      return [...currentIngredient, action.ingredient ];
    case 'DELETE':
      return currentIngredient.filter(ing => ing.id !== action.id);
      default: throw new Error('Should not get there');
  }
}

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return {loading: true, error: null}
    case 'RESPONSE':
      return {...curHttpState , loading: false}
    case 'ERROR':
        return {loading: false, error: action.errorMessage}
    case 'CLEAR':
        return {...curHttpState , error: null}
      default:
        throw new Error('Should not be reached')
  }
}

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});
  /* const [userIngredients, setUserIngredients] = useState([]); */
  /* const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(); */

  useEffect(() => {
    console.log('RE-RENDER INGREDIENTS');
  }, [userIngredients])

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    /* setUserIngredients(filteredIngredients); */
    console.log(filteredIngredients);
    dispatch({type:'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-update-5c077-default-rtdb.firebaseio.com/ingredients.json',{
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: {'Content-Type': 'application/json'},
    }).then(response =>{
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
    }).then(responseData => { console.log(responseData);
      dispatch({type: 'ADD', ingredient: {id:responseData.name, ...ingredient}});
  }).catch(error => {  
    dispatchHttp({type: 'ERROR', errorMessage: error.message });
  });
}, []);

  const removeIngredientHandler = useCallback(ingredientId => { 
    dispatchHttp({type: 'SEND'});
    fetch(`https://react-hooks-update-5c077-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
    {
      method: 'DELETE'
    }
    ).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      /* setUserIngredients(prevIngredients =>
        prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      ); */
      dispatch({type: 'DELETE', id:ingredientId});
    }).catch(error => {  
      dispatchHttp({type: 'ERROR', errorMessage: error.message });
    });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({type: 'CLEAR'});
  },[]);

  const ingredientList = useMemo(() => { // rerun the <IngredientList> if the 'userIngredients' been changed
    return <IngredientList 
              ingredients={userIngredients} 
              onRemoveItem={removeIngredientHandler}
           />

  },[userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
