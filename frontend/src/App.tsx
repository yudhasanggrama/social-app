
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute';
import LogoutButton from './components/LogoutButton';
import { Provider } from 'react-redux';
import { store } from './store';

export const Header = () => (
  <>
    <nav className="flex justify-between p-4">
        <h1>Circle</h1>
        <LogoutButton />
    </nav>
    <div className="text-center mt-5">
      <h1>Hello World</h1>
    </div>
  </>
);

function App() {

  return (
    <>
      <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* guest routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Header />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
    </>
  )
}

export default App
