import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    openStates: {
      profile: false,
      notification: false,
      message: false,
      addPost: false,
      editPost: false,

    },
    chatId:"empty",

    editId: "",
    chat:false


  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem("user", JSON.stringify(state.user))
      window.location.href = '/';
    },
    clearUser: (state) => {
      localStorage.setItem("user", JSON.stringify(null))
      window.location.href = '/signin';
    },
    openSettings: (state, action) => {
      const { payload } = action;
      const openStates = { ...state.openStates }; // create a copy of the original object

      // toggle the value of the specified property between true and false
      openStates[payload] = !openStates[payload];

      // set all other properties to false if the specified property is now true
      if (openStates[payload]) {
        Object.keys(openStates).forEach(key => {
          if (key !== payload) {
            openStates[key] = false;
          }
        });
      }

      state.openStates = openStates;
    },
    getPost: (state, action) => {
      state.editId = action.payload;
    },
    setChatId:(state,action)=>{
      state.chatId =action.payload
    },
    openChat:(state,action)=>{
      Object.keys(state.openStates).forEach(key => {
        state.openStates[key] = key === 'chat';
      });
    
      state.chat = true;
    },
    closeChat:(state,action)=>{
      Object.keys(state.openStates).forEach(key => {
        state.openStates[key] = key === 'chat';
      });
    
      state.chat = false;
    }
  }
});

export const { setUser, clearUser, openSettings, getPost ,setChatId,openChat,closeChat} = userSlice.actions;
export default userSlice.reducer;