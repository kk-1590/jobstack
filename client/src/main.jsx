import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import 'react-toastify/dist/ReactToastify.css';
import './index.css'

import { ToastContainer } from 'react-toastify';

// fetch('/api/v1/test').then((res) => res.json()).then((data) => console.log(data));

const response = await axios.get('/api/v1/test');
console.log(response.data);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer position='top-center'/>
  </React.StrictMode>,
)
