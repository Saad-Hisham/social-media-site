import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './Redux';

const store = configureStore({
  reducer: {
    user: counterReducer,
  },
});

export default store;